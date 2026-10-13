"""Package the three A3 source archives without machine-specific files."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from shutil import copyfile
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
API_FILES = (".env.example", "event_db.js", "package.json", "package-lock.json",
             "schema.sql", "server.js", "passenger.js", "validation.js", "test/api.test.js")
DOC_FILES = ("architecture.md", "deployment.md", "rubric-checklist.md",
             "local-verification.md", "video-checklist.md", "AI-use.md",
             "scu-deployment-2026-10-13.md")
SCRIPT_FILES = ("package_delivery.py", "preview.ps1")
SHARED_FILES = ("style.css", "forms.css", "js/config.js", "js/shared.js",
                "vendor/angular.min.js", "vendor/ANGULAR-LICENSE.txt")


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def site_files(folder: str) -> list[Path]:
    files = sorted(path for path in (ROOT / folder).rglob("*") if path.is_file())
    for path in files:
        if path.is_symlink() or path.suffix.lower() not in {".html", ".css", ".js", ".jpg", ".txt"}:
            raise ValueError(f"Unexpected site file: {path.relative_to(ROOT)}")
    return files


def verify_shared_assets() -> None:
    assets = SHARED_FILES + tuple("images/" + p.name for p in sorted((ROOT / "clientside/assets/images").glob("*.jpg")))
    for name in assets:
        public = ROOT / "clientside/assets" / name
        staff = ROOT / "adminside/assets" / name
        if not staff.is_file() or digest(public) != digest(staff):
            raise ValueError(f"Shared asset differs: {name}. Synchronise both copies before packaging.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--username", default="username", help="SCU username used in archive names")
    parser.add_argument("--runtime-only", action="store_true",
                        help="Include application files only, without project notes or helper scripts")
    args = parser.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,79}", args.username):
        parser.error("Use letters, numbers, dots, underscores or hyphens for the username.")
    verify_shared_assets()
    api_files = [ROOT / "api" / name for name in API_FILES
                 if not (args.runtime_only and name.startswith("test/"))]
    if not args.runtime_only:
        api_files += ([ROOT / "docs" / name for name in DOC_FILES]
                      + [ROOT / "scripts" / name for name in SCRIPT_FILES]
                      + [ROOT / "README.md", ROOT / "HANDOFF.md"])
    groups = {
        "clientside": site_files("clientside"),
        "adminside": site_files("adminside"),
        "api": api_files,
    }
    output = ROOT / "delivery"
    output.mkdir(exist_ok=True)
    version = json.loads((ROOT / "api/package.json").read_text(encoding="utf-8"))["version"]
    manifest = {"username": args.username, "version": version,
                "profile": "runtime" if args.runtime_only else "source", "archives": []}
    for folder, files in groups.items():
        archive = output / f"{args.username}A3-{folder}.zip"
        entries = []
        with ZipFile(archive, "w", compression=ZIP_DEFLATED, compresslevel=9) as package:
            for path in files:
                if not path.is_file() or path.is_symlink():
                    raise ValueError(f"Missing file or link: {path}")
                name = path.relative_to(ROOT).as_posix()
                package.write(path, name)
                entries.append({"path": name, "sha256": digest(path)})
        with ZipFile(archive) as package:
            if package.testzip() is not None or set(package.namelist()) != {e["path"] for e in entries}:
                raise ValueError(f"ZIP verification failed: {archive.name}")
        manifest["archives"].append({"file": archive.name, "bytes": archive.stat().st_size,
                                     "sha256": digest(archive), "files": entries})
        print(f"{archive.name}: {len(entries)} files, {archive.stat().st_size:,} bytes")
    copyfile(ROOT / "api/schema.sql", output / "schema.sql")
    manifest["sql"] = {"file": "schema.sql", "sha256": digest(output / "schema.sql")}
    manifest_path = output / (f"{args.username}A3-manifest.json" if args.runtime_only else "manifest.json")
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("SQL and SHA-256 manifest written. No .env, node_modules, .git or local database included.")


if __name__ == "__main__":
    main()
