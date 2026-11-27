// 자동 빌드 때 실행돼요. 새로 만들어진 안드로이드 프로젝트에 이 앱에 필요한 설정 3가지를 넣어요.
//  1) 기기의 음성 합성(TTS)을 찾을 수 있게 하는 설정 (안드로이드 11 이상에서 필요)
//  2) 매번 같은 서명으로 앱을 만드는 설정 (설치된 앱 위에 덮어 설치하려면 서명이 같아야 해요)
//  3) 버전 번호 (BUILD_NUMBER, 빌드할 때마다 커져요)
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const app = path.join(root, 'android', 'app');
const build = String(process.env.BUILD_NUMBER || '1');
if (!/^\d+$/.test(build)) throw new Error('BUILD_NUMBER는 숫자여야 해요: ' + build);

// 1) 매니페스트: <queries> 추가
const manifestPath = path.join(app, 'src', 'main', 'AndroidManifest.xml');
let manifest = fs.readFileSync(manifestPath, 'utf8');
if (!manifest.includes('<queries>')) {
  const tag = '<manifest xmlns:android="http://schemas.android.com/apk/res/android">';
  if (!manifest.includes(tag)) throw new Error('AndroidManifest.xml 모양이 예상과 달라요. 이 파일 내용을 알려 주세요.');
  manifest = manifest.replace(tag, tag + '\n\n    <!-- 기기의 음성 합성(TTS)을 찾을 수 있게 해요 (안드로이드 11 이상에서 필요) -->\n    <queries>\n        <intent>\n            <action android:name="android.intent.action.TTS_SERVICE" />\n        </intent>\n    </queries>\n');
  fs.writeFileSync(manifestPath, manifest);
}

// 2) 서명 설정 + 3) 버전 번호
const gradlePath = path.join(app, 'build.gradle');
let gradle = fs.readFileSync(gradlePath, 'utf8');
if (!gradle.includes('signingConfigs')) {
  const anchor = '    compileSdk = rootProject.ext.compileSdkVersion\n';
  if (!gradle.includes(anchor)) throw new Error('app/build.gradle 모양이 예상과 달라요. 이 파일 내용을 알려 주세요.');
  gradle = gradle.replace(anchor, anchor + `    // 업데이트할 때마다 같은 서명으로 만들어서, 이미 설치한 앱 위에 그대로 덮어 설치할 수 있게 해요 (가족용 설치 파일이라 이렇게 해요)
    signingConfigs {
        debug {
            storeFile file('jihwan-playroom.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
`);
}
if (!/versionCode \d+/.test(gradle) || !/versionName "[^"]*"/.test(gradle)) throw new Error('버전 정보를 찾지 못했어요. app/build.gradle 내용을 알려 주세요.');
gradle = gradle.replace(/versionCode \d+/, 'versionCode ' + build).replace(/versionName "[^"]*"/, 'versionName "1.' + build + '"');
fs.writeFileSync(gradlePath, gradle);

fs.copyFileSync(path.join(root, 'signing', 'jihwan-playroom.keystore'), path.join(app, 'jihwan-playroom.keystore'));
console.log('안드로이드 설정 완료 (빌드 번호 ' + build + ')');
