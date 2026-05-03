import { BrowserPod } from 'browserpod';

export class BrowserPodService {
  constructor() {
    this.pod = null;
    this.terminal = null;
    this.isReady = false;
    this.isInitializing = false;
    this.initPromise = null;
  }

  async initialize(apiKey) {
    if (this.isReady) return;
    if (this.isInitializing) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = this._doInitialize(apiKey);
    return this.initPromise;
  }

  async _doInitialize(apiKey) {
    console.log("🚀 Initializing BrowserPod...");
    try {
      // Use a session-specific storage key to prevent OPFS lock conflicts between tabs/reloads
      let sessionKey = sessionStorage.getItem('bp-storage-key');
      if (!sessionKey) {
        sessionKey = `policylens-${Math.random().toString(36).substring(7)}`;
        sessionStorage.setItem('bp-storage-key', sessionKey);
      }

      // Try to boot with retries for the OPFS lock
      let attempts = 0;
      while (attempts < 2) {
        try {
          this.pod = await BrowserPod.boot({
            apiKey: apiKey || import.meta.env.VITE_BP_APIKEY || "demo_key",
            nodeVersion: "22",
            storageKey: sessionKey
          });
          break; // Success!
        } catch (bootErr) {
          if (bootErr.name === 'NoModificationAllowedError' || bootErr.message.includes('createSyncAccessHandle')) {
            console.warn("⚠️ OPFS lock detected, retrying with unique key...");
            sessionKey = `policylens-retry-${Math.random().toString(36).substring(7)}`;
            attempts++;
          } else {
            throw bootErr; // Re-throw other errors
          }
        }
      }

      if (!this.pod) throw new Error("Could not initialize BrowserPod storage");

      // Use the UI terminal
      const termEl = document.getElementById('bp-terminal');
      if (!termEl) throw new Error("Terminal element not found");
      this.terminal = await this.pod.createDefaultTerminal(termEl);

      // Register Portal handler
      this.pod.onPortal(({ url, port }) => {
        console.log(`🌍 Portal URL captured: ${url} (local port ${port})`);
        if (this.onPortalCallback) {
          this.onPortalCallback({ url, port });
        }
      });

      await this.syncFileSystem();
      this.isReady = true;
      this.isFallback = false;
      console.log("✅ BrowserPod Ready.");
    } catch (err) {
      console.error("❌ BrowserPod failed to boot:", err);
      // Fallback mode
      this.isReady = true;
      this.isFallback = true;
      this.isInitializing = false;
      console.warn("⚠️ BrowserPod falling back to offline mode.");
    }
  }

  async syncFileSystem() {
    console.log("📂 Syncing project files to Pod...");
    await this.pod.createDirectory("/project", { recursive: true });
    await this.pod.createDirectory("/project/src", { recursive: true });
    await this.pod.createDirectory("/project/src/agents", { recursive: true });
    await this.pod.createDirectory("/project/src/engine", { recursive: true });
    await this.pod.createDirectory("/project/src/assets", { recursive: true });
    await this.pod.createDirectory("/project/src/data", { recursive: true });

    // List of files to copy from the public/vite server to the pod
    const files = [
      'index.html',
      'style.css',
      'main.js',
      'src/orchestrator.js',
      'src/browserpod_service.js',
      'src/agents/studentAgent.js',
      'src/agents/employerAgent.js',
      'src/agents/smallBusinessAgent.js',
      'src/agents/governmentAgent.js',
      'src/agents/publicAgent.js',
      'src/agents/economistAgent.js',
      'src/agents/workerAgent.js',
      'src/agents/securityAgent.js',
      'src/engine/synthesisEngine.js',
      'src/engine/knowledgeEngine.js',
      'src/data/mockData.js',
      'src/assets/hero.png',
      'src/assets/javascript.svg',
      'src/assets/vite.svg'
    ];

    for (const path of files) {
      await this.copyToPod(path);
    }
    
    // Create a runner script in the pod
    const runnerCode = `
import { PolicyOrchestrator } from './src/orchestrator.js';

async function run() {
  const [,, cmd, ...args] = process.argv;
  const orchestrator = new PolicyOrchestrator();
  
  if (cmd === 'analyze') {
    const [policy, category] = args;
    const results = await orchestrator.runInitialAnalysis(policy, category);
    console.log(JSON.stringify(results));
  } else if (cmd === 'debate') {
    const [policy, category, round, agentsJson] = args;
    orchestrator.state.policy = policy;
    orchestrator.state.category = category;
    orchestrator.state.agents = JSON.parse(agentsJson);
    const result = await orchestrator.runDebateRound(parseInt(round));
    console.log(JSON.stringify(result));
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
`;
    await this.writeFile("/project/runner.js", runnerCode);
  }

  async copyToPod(path) {
    try {
      const resp = await fetch('/' + path);
      if (!resp.ok) throw new Error(`Failed to fetch ${path}`);
      const content = await resp.text();
      await this.writeFile("/project/" + path, content);
    } catch (err) {
      console.warn(`Could not sync ${path}:`, err);
    }
  }

  async writeFile(path, content) {
    const f = await this.pod.createFile(path, "utf-8");
    await f.write(content);
    await f.close();
  }

  async runTask(cmd, args) {
    if (!this.isReady) throw new Error("Pod not ready");
    
    if (this.isFallback) {
      console.log(`🛠️ Fallback: Simulating task ${cmd} with args ${args}`);
      await new Promise(res => setTimeout(res, 1000));
      return true;
    }

    let output = "";
    const result = await this.pod.run("node", ["/project/runner.js", cmd, ...args], {
      terminal: this.terminal,
      cwd: "/project",
      echo: false
    });

    // Since we're using await this.pod.run, the process has already completed
    // and 'result' is actually the outcome object (with exitCode, stdout, etc.)
    // which does not have a .wait() method.
    
    return true; 
  }

  async startServer() {
    if (!this.isReady) throw new Error("Pod not ready");
    if (this.isFallback) {
      console.warn("⚠️ Cannot start server in fallback mode.");
      return;
    }

    console.log("🚀 Starting isolated static file server in BrowserPod...");
    
    const serverCode = `
const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join('/project', urlPath === '/' ? 'index.html' : urlPath);
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  console.log(\`[Server] Request: \${req.url} -> \${filePath} (\${contentType})\`);

  fs.readFile(filePath, (error, content) => {
    if (error) {
      console.error(\`[Server] Error: \${filePath} - \${error.code}\`);
      if(error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found: ' + filePath);
      } else {
        res.writeHead(500);
        res.end('Server error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(3000, () => {
  console.log('✅ Static server successfully listening on port 3000');
});
    `;

    await this.writeFile("/project/server.js", serverCode);

    this.pod.run("node", ["/project/server.js"], {
      terminal: this.terminal,
      cwd: "/project",
      echo: true
    });
  }
}

export const bpService = new BrowserPodService();
