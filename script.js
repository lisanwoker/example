// 두 개의 API 키와 고정된 학교 및 지역 코드 설정
API_KEY_1 = '59dac55771ee493a96069ec1d23abc1f'  //첫 번째 API 키를 입력하세요.
API_KEY_2 = '6d81c3d8b66346c29f3842761c60ddde'  //두 번째 API 키를 입력하세요.
ATPT_OFCDC_SC_CODE = 'J10'  
SD_SCHUL_CODE = '7530122'   

// 오늘 날짜와 다음날 날짜를 가져와서 YYYYMMDD 형식으로 변환
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

const MLSV_YMD_TODAY = today.toISOString().slice(0, 10).replace(/-/g, '');
const MLSV_YMD_TOMORROW = tomorrow.toISOString().slice(0, 10).replace(/-/g, '');

// API URL 생성
const createUrl = (apiKey, date) => 
    `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${apiKey}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${SD_SCHUL_CODE}&MLSV_YMD=${date}`;

// API 요청 함수
const fetchMealData = (url, fallbackUrl, dateTitle, apiNumber) => {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`${dateTitle}의 API 호출 실패`);
            }
            return response.json();
        })
        .then(data => {
            const mealInfoDiv = document.getElementById('meal-info');

            // 급식 정보 출력
            if (data.mealServiceDietInfo) {
                const mealInfo = data.mealServiceDietInfo[1].row;
                mealInfoDiv.innerHTML += `<h2>${dateTitle}</h2>`;
                mealInfo.forEach(meal => {
                    const mealDiv = document.createElement('div');
                    mealDiv.classList.add('meal');

                    mealDiv.innerHTML = `
                        <h3>${meal.MLSV_YMD} - ${meal.MMEAL_SC_NM}</h3>
                        <p>${meal.DDISH_NM.replace(/<br\/>/g, ', ')}</p>
                        <p class="calories">칼로리 정보: ${meal.CAL_INFO}</p>
                    `;

                    mealInfoDiv.appendChild(mealDiv);
                });

                // 몇 번째 API를 사용했는지 표시
                const apiInfoDiv = document.createElement('div');
                apiInfoDiv.classList.add('api-info');
                apiInfoDiv.innerHTML = `<p>사용된 API: ${apiNumber}번째 API</p>`;
                mealInfoDiv.appendChild(apiInfoDiv);
            } else {
                mealInfoDiv.innerHTML += `<p>${dateTitle}의 급식 정보가 없습니다.</p>`;
            }
        })
        .catch(error => {
            console.error(`${dateTitle}의 API 호출에 실패:`, error);

            if (fallbackUrl) {
                // 첫 번째 API가 실패했을 때 두 번째 API 호출
                console.log(`${dateTitle}에 대한 두 번째 API 호출 시도 중...`);
                fetchMealData(fallbackUrl, null, dateTitle, 2);
            } else {
                document.getElementById('meal-info').innerHTML += `<p>${dateTitle}의 API 요청에 실패했습니다. 나중에 다시 시도하세요.</p>`;
            }
        });
};

// 첫 번째 API URL 생성
const urlToday1 = createUrl(API_KEY_1, MLSV_YMD_TODAY);
const urlTomorrow1 = createUrl(API_KEY_1, MLSV_YMD_TOMORROW);

// 두 번째 API URL 생성
const urlToday2 = createUrl(API_KEY_2, MLSV_YMD_TODAY);
const urlTomorrow2 = createUrl(API_KEY_2, MLSV_YMD_TOMORROW);

// 첫 번째 API 호출 시도, 실패 시 두 번째 API 호출
fetchMealData(urlToday1, urlToday2, '오늘 급식', 1);
fetchMealData(urlTomorrow1, urlTomorrow2, '내일 급식', 1);