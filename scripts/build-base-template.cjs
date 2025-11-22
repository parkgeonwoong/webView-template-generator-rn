/* Node 환경에서 임시로 템플릿 빌드하는 스크립트 */

const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

const rootDir = path.resolve(__dirname, "..", "..");
const templateDir = path.join(rootDir, "rnBaseTemplate");
const outputDir = path.join(rootDir, "rn-webview-generator", "public", "templates");
const outputZipPath = path.join(outputDir, "rnBaseTemplate.zip");

console.log("[경로] rootDir:", rootDir);

const ignorePatterns = [
  "node_modules",
  ".git",
  "ios/Pods",
  "ios/build",
  "android/build",
  "android/.gradle",
  "android/.kotlin",
];

/**
 * 특정 폴더를 zip에 재귀적으로 추가
 * @param zipFolder : zip 파일 내부의 위치
 * @param folderPath : 원본 폴더 경로
 * @param zipFolderPath : zip 안에서 이 폴더가 어떤 경로로 들어갈지 문자열로 기록하는 용도
 */
function addFolderToZip(zipFolder, folderPath, zipFolderPath = "") {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true }); // 안에 있는 파일과 폴더 목록을 가져옴

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name); // 원본 파일 경로
    const relativePath = path.relative(templateDir, fullPath).replace(/\\/g, "/"); // 원본 파일 경로를 templateDir(rnBaseTemplate) 기준으로 상대 경로로 변환

    const shouldIgnore = ignorePatterns.some((pattern) => {
      return relativePath === pattern || relativePath.startsWith(pattern + "/");
    });

    if (shouldIgnore) continue;

    const zipPath = path.posix.join(zipFolderPath, entry.name); // 압축 파일 경로

    // 폴더인 경우 재귀적으로 추가
    if (entry.isDirectory()) {
      const childZipFolder = zipFolder.folder(entry.name);
      addFolderToZip(childZipFolder, fullPath, zipPath);
    } else {
      const fileData = fs.readFileSync(fullPath);
      zipFolder.file(zipPath, fileData);
    }
  }
}

async function main() {
  console.log("rnBaseTemplate 폴더를 zip으로 생성 중...");

  const zip = new JSZip();
  const rootZipFolder = zip.folder("rnBaseTemplate");

  addFolderToZip(rootZipFolder, templateDir);

  const content = await zip.generateAsync({ type: "nodebuffer" });

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputZipPath, content);

  console.log("[경로] 생성 완료:", outputZipPath);
}

main().catch((err) => {
  console.error("템플릿 생성 실패", err);
  process.exit(1);
});
