// Last change date of a content file, from git: the date of the last CMS save (each save is a commit).
// Google only uses sitemap <lastmod> when it is reliable: in a shallow clone every file would get
// the date of the last commit, so no date is returned at all then.
import { execFileSync } from "node:child_process";

const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

let usable: boolean | undefined;
function historyAvailable() {
  if (usable === undefined) {
    try {
      usable = git("rev-parse", "--is-shallow-repository") === "false";
    } catch {
      usable = false; // not a git checkout
    }
  }
  return usable;
}

export function lastModified(...files: string[]): string | undefined {
  if (!historyAvailable()) return undefined;
  try {
    return git("log", "-1", "--format=%cI", "--", ...files) || undefined;
  } catch {
    return undefined;
  }
}
