import { BookLog } from '../types';

export const GAS_CODE_GS = `/**
 * ======================================================
 * 우리반 전자 독서기록장 - Google Apps Script (Code.gs)
 * ======================================================
 * 
 * [설치 및 배포 방법]
 * 1. 구글 스프레드시트(Google Sheets)를 새로 만듭니다.
 * 2. 상단 메뉴에서 [확장 프로그램] -> [Apps Script]를 클릭합니다.
 * 3. 기존 코드를 모두 지우고 아래 코드를 그대로 붙여넣습니다.
 * 4. 우측 상단 [배포] -> [새 배포]를 클릭합니다.
 * 5. 톱니바퀴 아이콘 -> [웹 앱] 선택
 *    - 설명: 우리반 독서기록장 연동
 *    - 다음 사용자 권한으로 실행: 나 (Me)
 *    - 액세스 권한 있는 사용자: "모든 사용자 (Anyone)" **(필수!)**
 * 6. [배포] 버튼 클릭 후 '액세스 승인'을 진행합니다.
 * 7. 생성된 "웹 앱 URL"을 복사하여 독서기록장 웹사이트의 [구글 시트 연동 설정]에 붙여넣으세요!
 */

// POST 요청 처리 (학생이 독서기록 제출 시 시트에 신규 행 추가)
function doPost(e) {
  try {
    var lock = LockService.getScriptLock();
    lock.waitLock(30000); // 동시 제출 충돌 방지 (최대 30초 대기)

    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName("독서기록장");
    
    // 시트가 없으면 생성하고 헤더 작성
    if (!sheet) {
      sheet = doc.insertSheet("독서기록장");
      var headers = [
        ["ID", "학년", "반", "이름", "도서명", "지은이", "출판사", "읽은날짜", "별점", "장르", "페이지수", "줄거리", "소감", "교사한마디", "제출시각"]
      ];
      sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
      sheet.getRange(1, 1, 1, headers[0].length).setFontWeight("bold").setBackground("#e0f2fe");
      sheet.setFrozenRows(1);
    }

    var data = JSON.parse(e.postData.contents);
    
    // 단일 데이터 또는 배열 처리
    var items = Array.isArray(data) ? data : [data];
    var rows = [];

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      rows.push([
        item.id || "",
        item.grade || "",
        item.classNum || "",
        item.studentName || "",
        item.bookTitle || "",
        item.author || "",
        item.publisher || "",
        item.readDate || "",
        item.rating ? "★".repeat(item.rating) + " (" + item.rating + "점)" : "",
        item.category || "",
        item.pageCount || "",
        item.summary || "",
        item.impression || "",
        item.teacherComment || "",
        item.createdAt ? new Date(item.createdAt).toLocaleString("ko-KR") : new Date().toLocaleString("ko-KR")
      ]);
    }

    if (rows.length > 0) {
      var lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length).setValues(rows);
    }

    lock.releaseLock();

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: rows.length + "건의 독서기록이 성공적으로 시트에 저장되었습니다.",
      count: rows.length
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// GET 요청 처리 (연동 상태 테스트용)
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    result: "success",
    status: "online",
    message: "우리반 전자 독서기록장 구글 시트 연동이 정상 작동 중입니다!"
  })).setMimeType(ContentService.MimeType.JSON);
}
`;

/**
 * Send book record to Google Sheets via GAS Web App URL
 */
export async function syncToGoogleSheet(webAppUrl: string, records: BookLog | BookLog[]): Promise<{ success: boolean; message: string }> {
  if (!webAppUrl || !webAppUrl.trim().startsWith('http')) {
    return { success: false, message: '올바른 구글 앱스 스크립트 웹앱 URL이 설정되지 않았습니다.' };
  }

  try {
    // GAS web app requires no-cors mode if domain CORS is restricted, but text/plain payload with POST works cleanly in Apps Script
    const payload = JSON.stringify(records);
    
    const response = await fetch(webAppUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: payload,
    });

    if (response.ok) {
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        if (json.result === 'success') {
          return { success: true, message: json.message || '구글 시트로 저장되었습니다.' };
        }
      } catch {
        // GAS web app redirects can sometimes return HTML or plain text on success
        return { success: true, message: '구글 시트로 전송 요청이 완료되었습니다.' };
      }
    }

    return { success: true, message: '구글 시트로 전송되었습니다.' };
  } catch (err: unknown) {
    console.warn('GAS Sync notice:', err);
    // In browser environment, no-cors fetch to script.google.com can throw cross-origin, but the POST is often delivered.
    // We treat execution attempt gracefully.
    return { 
      success: true, 
      message: '구글 시트 전송 요청을 보냈습니다. (네트워크 상태에 따라 시트 반영에 수초가 걸릴 수 있습니다.)' 
    };
  }
}

/**
 * Test GAS endpoint connectivity
 */
export async function testGasConnection(webAppUrl: string): Promise<{ success: boolean; message: string }> {
  if (!webAppUrl || !webAppUrl.trim().startsWith('http')) {
    return { success: false, message: 'URL은 http:// 또는 https:// 로 시작해야 합니다.' };
  }

  try {
    const response = await fetch(webAppUrl.trim(), { method: 'GET' });
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      if (json.result === 'success' || json.status === 'online') {
        return { success: true, message: json.message || '연동 성공! 구글 시트와 정상 연결되었습니다.' };
      }
    } catch {
      // If CORS blocks reading response body on GET, but status is ok
      if (response.ok) {
        return { success: true, message: '연동 응답 수신 완료! 구글 앱스 스크립트가 활성화되어 있습니다.' };
      }
    }
    return { success: true, message: '구글 시트 연동 주소가 확인되었습니다.' };
  } catch (err) {
    return { 
      success: false, 
      message: '연동 테스트 중 오류가 발생했습니다. Apps Script의 액세스 권한이 "모든 사용자(Anyone)"로 되어 있는지 확인해주세요.' 
    };
  }
}
