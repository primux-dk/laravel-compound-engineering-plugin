import path from "path"
import { copyDir, ensureDir, writeJson, writeText } from "../utils/files"
import type { OpenCodeBundle } from "../types/opencode"

export async function writeOpenCodeBundle(outputRoot: string, bundle: OpenCodeBundle): Promise<void> {
  const paths = resolveOpenCodePaths(outputRoot)
  await ensureDir(paths.root)
  await writeJson(paths.configPath, bundle.config)

  const agentsDir = paths.agentsDir
  for (const agent of bundle.agents) {
    await writeText(path.join(agentsDir, `${agent.name}.md`), agent.content + "\n")
  }

  if (bundle.plugins.length > 0) {
    const pluginsDir = paths.pluginsDir
    for (const plugin of bundle.plugins) {
      await writeText(path.join(pluginsDir, plugin.name), plugin.content + "\n")
    }
  }

  if (bundle.skillDirs.length > 0) {
    const skillsRoot = paths.skillsDir
    for (const skill of bundle.skillDirs) {
      await copyDir(skill.sourceDir, path.join(skillsRoot, skill.name))
    }
  }
}

function resolveOpenCodePaths(outputRoot: string) {
  if (path.basename(outputRoot) === ".opencode") {
    return {
      root: outputRoot,
      configPath: path.join(outputRoot, "opencode.json"),
      agentsDir: path.join(outputRoot, "agents"),
      pluginsDir: path.join(outputRoot, "plugins"),
      skillsDir: path.join(outputRoot, "skills"),
    }
  }

  return {
    root: outputRoot,
    configPath: path.join(outputRoot, "opencode.json"),
    agentsDir: path.join(outputRoot, ".opencode", "agents"),
    pluginsDir: path.join(outputRoot, ".opencode", "plugins"),
    skillsDir: path.join(outputRoot, ".opencode", "skills"),
  }
}
