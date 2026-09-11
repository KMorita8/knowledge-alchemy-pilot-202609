// ============================================================
// Knowledge Alchemy
// 予備実験専用UI
// ============================================================


const DATA_FILE =
    "pilot_3vs6_ui_data_20260907.json";


// ============================================================
// スマートフォンの引っ張って再読み込みを抑える
// ============================================================

let pullStartY = null;

document.addEventListener(
    "touchstart",
    function (event) {

        if (
            window.scrollY <= 0
            && event.touches.length === 1
        ) {
            pullStartY =
                event.touches[0].clientY;
        } else {
            pullStartY = null;
        }
    },
    { passive: true }
);

document.addEventListener(
    "touchmove",
    function (event) {

        if (
            pullStartY !== null
            && event.touches.length === 1
            && event.touches[0].clientY > pullStartY
        ) {
            event.preventDefault();
        }
    },
    { passive: false }
);

document.addEventListener(
    "touchend",
    function () {
        pullStartY = null;
    },
    { passive: true }
);


// ============================================================
// 割当パターン
// ============================================================

const experimentPatterns = {

    A: [
        { themeIndex: 0, condition: 3 },
        { themeIndex: 1, condition: 6 },
        { themeIndex: 2, condition: 3 },
        { themeIndex: 3, condition: 6 }
    ],

    B: [
        { themeIndex: 0, condition: 6 },
        { themeIndex: 1, condition: 3 },
        { themeIndex: 2, condition: 6 },
        { themeIndex: 3, condition: 3 }
    ],

    C: [
        { themeIndex: 1, condition: 3 },
        { themeIndex: 0, condition: 6 },
        { themeIndex: 3, condition: 3 },
        { themeIndex: 2, condition: 6 }
    ],

    D: [
        { themeIndex: 1, condition: 6 },
        { themeIndex: 0, condition: 3 },
        { themeIndex: 3, condition: 6 },
        { themeIndex: 2, condition: 3 }
    ]
};


// ============================================================
// 実験中の状態
// ============================================================

let pilotData = null;

let participant = {
    participantId: "",
    grade: "",
    pattern: ""
};

let currentStep = 0;

let selectedBook = null;

let experimentLog = [];


// ============================================================
// HTML要素
// ============================================================

const setupScreen =
    document.getElementById(
        "setup-screen"
    );

const taskScreen =
    document.getElementById(
        "task-screen"
    );

const entryScreen =
    document.getElementById(
        "entry-screen"
    );

const relatedScreen =
    document.getElementById(
        "related-screen"
    );

const surveyScreen =
    document.getElementById(
        "survey-screen"
    );

const finalSurveyScreen =
    document.getElementById(
        "final-survey-screen"
    );

const finishScreen =
    document.getElementById(
        "finish-screen"
    );


const participantIdInput =
    document.getElementById(
        "participant-id"
    );

const gradeSelect =
    document.getElementById(
        "grade"
    );

const patternSelect =
    document.getElementById(
        "pattern"
    );

const setupError =
    document.getElementById(
        "setup-error"
    );



// ============================================================
// 専用URLから参加者IDと割当パターンを設定
// ============================================================

const participantAssignments = {
    "101": "A",
    "102": "B",
    "103": "C",
    "104": "D",
    "105": "A",
    "106": "B",
    "107": "C",
    "108": "D",
    "109": "A",
    "110": "B"
};


function applyParticipantAssignmentFromUrl() {

    const urlParameters =
        new URLSearchParams(
            window.location.search
        );

    const participantId =
        urlParameters.get(
            "participant"
        );

    if (!participantId) {
        return;
    }


    const assignedPattern =
        participantAssignments[
            participantId
        ];

    if (!assignedPattern) {

        setupError.textContent =
            "この参加者用リンクは使用できません。";

        return;
    }


    participantIdInput.value =
        participantId;

    patternSelect.value =
        assignedPattern;


    participantIdInput.readOnly =
        true;

    patternSelect.disabled =
        true;


    const participantGroup =
        participantIdInput.closest(
            ".form-group"
        );

    const patternGroup =
        patternSelect.closest(
            ".form-group"
        );


    if (participantGroup) {
        participantGroup.hidden = true;
    }

    if (patternGroup) {
        patternGroup.hidden = true;
    }
}


applyParticipantAssignmentFromUrl();


const taskText =
    document.getElementById(
        "task-text"
    );

const themeNumber =
    document.getElementById(
        "theme-number"
    );


const entryThemeNumber =
    document.getElementById(
        "entry-theme-number"
    );

const entryCover =
    document.getElementById(
        "entry-cover"
    );

const entryTitle =
    document.getElementById(
        "entry-title"
    );

const entryNdc =
    document.getElementById(
        "entry-ndc"
    );


const bookDetailPanel =
    document.getElementById(
        "book-detail-panel"
    );

const detailCover =
    document.getElementById(
        "detail-cover"
    );

const detailTitle =
    document.getElementById(
        "detail-title"
    );

const detailRelationLabel =
    document.getElementById(
        "detail-relation-label"
    );

const detailExplanation =
    document.getElementById(
        "detail-explanation"
    );


const surveyError =
    document.getElementById(
        "survey-error"
    );

const finalSurveyError =
    document.getElementById(
        "final-survey-error"
    );

const finalComment =
    document.getElementById(
        "final-comment"
    );

const downloadLogButton =
    document.getElementById(
        "download-log-button"
    );

const downloadStatus =
    document.getElementById(
        "download-status"
    );


// ============================================================
// ログ
// ============================================================

function addLog(
    eventName,
    details = {}
) {

    const log = {
        event:
            eventName,

        timestamp:
            new Date().toISOString(),

        participant_id:
            participant.participantId,

        grade:
            participant.grade,

        pattern:
            participant.pattern,

        step:
            currentStep + 1,

        ...details
    };


    experimentLog.push(
        log
    );

    saveExperimentLog();


    console.log(
        "LOG",
        log
    );
}


// ============================================================
// ログの一時保存とダウンロード
// ============================================================

function saveExperimentLog() {

    const participantId =
        participant.participantId
        || "unknown";

    const storageKey =
        "knowledge_alchemy_pilot_log_"
        + participantId;

    try {

        localStorage.setItem(
            storageKey,
            JSON.stringify(
                experimentLog
            )
        );

    } catch (error) {

        console.warn(
            "ログを一時保存できませんでした。",
            error
        );
    }
}


function loadStoredExperimentLog(
    participantId
) {

    if (!participantId) {
        return null;
    }

    const storageKey =
        "knowledge_alchemy_pilot_log_"
        + participantId;

    try {

        const storedText =
            localStorage.getItem(
                storageKey
            );

        if (!storedText) {
            return null;
        }

        const storedLog =
            JSON.parse(
                storedText
            );

        if (!Array.isArray(storedLog)) {
            return null;
        }

        return storedLog;

    } catch (error) {

        console.warn(
            "一時保存したログを読み込めませんでした。",
            error
        );

        return null;
    }
}


function downloadExperimentLog(
    logData = experimentLog,
    participantId = participant.participantId
) {

    const jsonText =
        JSON.stringify(
            logData,
            null,
            2
        );

    const blob =
        new Blob(
            [jsonText],
            {
                type:
                    "application/json"
            }
        );

    const downloadUrl =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    const safeParticipantId =
        (
            participantId
            || "unknown"
        ).replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
        );

    const completedLog =
        logData.find(
            function (item) {
                return item.event ===
                    "experiment_complete";
            }
        );

    const dateText =
        new Date(
            completedLog?.timestamp
            || Date.now()
        )
            .toISOString()
            .slice(
                0,
                10
            );

    link.href =
        downloadUrl;

    link.download =
        "pilot_log_"
        + safeParticipantId
        + "_"
        + dateText
        + ".json";

    document.body.appendChild(
        link
    );

    link.click();
    link.remove();

    setTimeout(
        function () {

            URL.revokeObjectURL(
                downloadUrl
            );
        },
        1000
    );
}


function restoreCompletedExperiment() {

    const urlParameters =
        new URLSearchParams(
            window.location.search
        );

    const participantId =
        urlParameters.get(
            "participant"
        );

    const storedLog =
        loadStoredExperimentLog(
            participantId
        );

    if (!storedLog) {
        return false;
    }

    const completed =
        storedLog.some(
            function (item) {
                return item.event ===
                    "experiment_complete";
            }
        );

    if (!completed) {
        return false;
    }

    const lastLog =
        storedLog[
            storedLog.length - 1
        ];

    participant = {
        participantId:
            participantId,

        grade:
            lastLog.grade || "",

        pattern:
            lastLog.pattern
            || participantAssignments[
                participantId
            ]
            || ""
    };

    experimentLog =
        storedLog;

    downloadStatus.textContent =
        "前回の結果が端末に残っています。ボタンを押して保存してください。";

    showScreen(
        finishScreen
    );

    return true;
}


function manuallyDownloadExperimentLog() {

    if (experimentLog.length === 0) {

        downloadStatus.textContent =
            "保存できる結果が見つかりませんでした。研究者へ連絡してください。";

        return;
    }

    downloadExperimentLog();

    downloadStatus.textContent =
        "保存を開始しました。ダウンロードまたはファイルを確認してください。";
}


// ============================================================
// JSON読み込み
// ============================================================

async function loadPilotData() {

    try {

        const response =
            await fetch(
                DATA_FILE
            );


        if (!response.ok) {

            throw new Error(
                "JSONを読み込めませんでした。"
            );
        }


        pilotData =
            await response.json();


        console.log(
            "予備実験データ読み込み完了",
            pilotData
        );


    } catch (error) {

        console.error(
            error
        );


        setupError.textContent =
            "実験データを読み込めませんでした。";
    }
}


// ============================================================
// 画面切り替え
// ============================================================

function showScreen(
    screen
) {

    const screens = [
        setupScreen,
        taskScreen,
        entryScreen,
        relatedScreen,
        surveyScreen,
        finalSurveyScreen,
        finishScreen
    ];


    for (
        const item of screens
    ) {

        item.classList.add(
            "hidden"
        );
    }


    screen.classList.remove(
        "hidden"
    );
}


// ============================================================
// 現在の割当
// ============================================================

function getCurrentAssignment() {

    return experimentPatterns[
        participant.pattern
    ][
        currentStep
    ];
}


// ============================================================
// 現在のテーマ
// ============================================================

function getCurrentTheme() {

    const assignment =
        getCurrentAssignment();


    return pilotData.themes[
        assignment.themeIndex
    ];
}


// ============================================================
// 実験開始
// ============================================================

function startExperiment() {

    const participantId =
        participantIdInput.value.trim();

    const grade =
        gradeSelect.value;

    const pattern =
        patternSelect.value;


    if (
        !participantId
        || !grade
        || !pattern
    ) {

        setupError.textContent =
            "参加者ID・学年・割当パターンを確認してください。";

        return;
    }


    if (!pilotData) {

        setupError.textContent =
            "実験データがまだ読み込まれていません。";

        return;
    }


    participant = {
        participantId:
            participantId,

        grade:
            grade,

        pattern:
            pattern
    };


    currentStep = 0;


    addLog(
        "experiment_start"
    );


    showTask();
}


// ============================================================
// 課題
// ============================================================

function showTask() {

    const theme =
        getCurrentTheme();


    themeNumber.textContent =
        currentStep + 1;


    taskText.innerHTML =
        makeRubyHtml(
            theme.task_text
        );


    addLog(
        "theme_start",
        {
            task:
                theme.task_text,

            condition:
                getCurrentAssignment().condition
        }
    );


    showScreen(
        taskScreen
    );
}


// ============================================================
// 入口本
// ============================================================

function showEntryBook() {

    const theme =
        getCurrentTheme();


    entryThemeNumber.textContent =
        currentStep + 1;


    entryTitle.innerHTML =
        makeRubyHtml(
            theme.entry_book.title
        );


    entryNdc.textContent = "";

    entryCover.src =
        "assets/covers/"
        + theme.entry_book.cover_file;


    entryCover.alt =
        theme.entry_book.title
        + " の表紙";


    addLog(
        "initial_recommendation",
        {
            title:
                theme.entry_book.title,

            isbn:
                theme.entry_book.isbn
        }
    );


    showScreen(
        entryScreen
    );
}


// ============================================================
// relation表示名
// ============================================================

function getRelationLabel(
    relation
) {

    if (
        relation ===
        "shared_subject"
    ) {

        return (
            "おなじ"
            + "<ruby>話題<rt>わだい</rt></ruby>"
        );
    }


    if (
        relation ===
        "shared_ndc"
    ) {

        return (
            "おなじ"
            + "<ruby>本<rt>ほん</rt></ruby>だな"
        );
    }


    return (
        "ことばから"
        + "<ruby>見<rt>み</rt></ruby>つけた"
    );
}
// ============================================================
// HTMLとして表示するときに、外部データを安全な文字へ変換する
// ============================================================

function escapeHtml(
    text
) {

    return String(
        text
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


// ============================================================
// 児童向け表示にルビを付ける
// 正式な書名やログの値は変更せず、画面表示だけを読みやすくする
// ============================================================

const rubyTerms = [
    ["農林水産業", "のうりんすいさんぎょう"],
    ["動物形態学", "どうぶつけいたいがく"],
    ["沿岸漁業", "えんがんぎょぎょう"],
    ["野生動物", "やせいどうぶつ"],
    ["最新情報", "さいしんじょうほう"],
    ["新伝説", "しんでんせつ"],
    [
        "知らない",
        "しらない",
        "<ruby>知<rt>し</rt></ruby>らない"
    ],
    [
        "生きる",
        "いきる",
        "<ruby>生<rt>い</rt></ruby>きる"
    ],
    ["小学生", "しょうがくせい"],
    ["理系脳", "りけいのう"],
    [
        "生きもの",
        "いきもの",
        "<ruby>生<rt>い</rt></ruby>きもの"
    ],
    ["奇妙", "きみょう"],
    ["話", "はなし"],
    ["世", "よ"],
    ["編", "へん"],
    ["目", "め"],
    ["図鑑", "ずかん"],
    ["動物学", "どうぶつがく"],
    ["動物", "どうぶつ"],
    ["生物", "せいぶつ"],
    ["植物", "しょくぶつ"],
    ["社会", "しゃかい"],
    ["生活", "せいかつ"],
    ["家族", "かぞく"],
    [
        "友だち",
        "ともだち",
        "<ruby>友<rt>とも</rt></ruby>だち"
    ],
    ["安全", "あんぜん"],
    [
        "使い方",
        "つかいかた",
        "<ruby>使<rt>つか</rt></ruby>い<ruby>方<rt>かた</rt></ruby>"
    ],
    [
        "使う",
        "つかう",
        "<ruby>使<rt>つか</rt></ruby>う"
    ],
    [
        "知って",
        "しって",
        "<ruby>知<rt>し</rt></ruby>って"
    ],
    [
        "知りたい",
        "しりたい",
        "<ruby>知<rt>し</rt></ruby>りたい"
    ],
    ["身", "み"],
    [
        "賢く",
        "かしこく",
        "<ruby>賢<rt>かしこ</rt></ruby>く"
    ],
    ["実践", "じっせん"],
    [
        "気をつけよう",
        "きをつけよう",
        "<ruby>気<rt>き</rt></ruby>をつけよう"
    ],
    ["動画", "どうが"],
    [
        "大好き",
        "だいすき",
        "<ruby>大<rt>だい</rt></ruby><ruby>好<rt>す</rt></ruby>き"
    ],
    [
        "作って",
        "つくって",
        "<ruby>作<rt>つく</rt></ruby>って"
    ],
    ["道具", "どうぐ"],
    ["洋菓子", "ようがし"],
    ["和菓子", "わがし"],
    ["菓子", "かし"],
    ["年生", "ねんせい"],
    [
        "伸ばす",
        "のばす",
        "<ruby>伸<rt>の</rt></ruby>ばす"
    ],
    [
        "遊び",
        "あそび",
        "<ruby>遊<rt>あそ</rt></ruby>び"
    ],
    [
        "驚き",
        "おどろき",
        "<ruby>驚<rt>おどろ</rt></ruby>き"
    ],
    [
        "来た",
        "きた",
        "<ruby>来<rt>き</rt></ruby>た"
    ],
    ["人", "ひと"],
    ["訓練士", "くんれんし"],
    ["福祉", "ふくし"],
    ["盲導犬", "もうどうけん"],
    ["聴導犬", "ちょうどうけん"],
    ["介助犬", "かいじょけん"],
    ["十戒", "じっかい"],
    ["犬", "いぬ"],
    ["仕事", "しごと"],
    ["農業", "のうぎょう"],
    ["牧場", "ぼくじょう"],
    ["依存症", "いぞんしょう"],
    ["活動", "かつどう"],
    ["職業", "しょくぎょう"],
    ["題名", "だいめい"],
    ["表紙", "ひょうし"],
    ["理由", "りゆう"],
    ["説明", "せつめい"],
    ["本", "ほん"]
];

function makeRubyHtml(
    text
) {

    const source =
        escapeHtml(
            text
        );

    const terms =
        [...rubyTerms]
            .sort(
                function (a, b) {
                    return b[0].length - a[0].length;
                }
            );

    const termMap =
        new Map(
            terms.map(
                function ([word, reading, customHtml]) {
                    return [
                        word,
                        {
                            reading: reading,
                            customHtml: customHtml
                        }
                    ];
                }
            )
        );

    const pattern =
        terms
            .map(
                function ([word]) {
                    return word.replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    );
                }
            )
            .join(
                "|"
            );

    const regex =
        new RegExp(
            pattern,
            "g"
        );

    return source.replace(
        regex,
        function (word) {

            const term =
                termMap.get(
                    word
                );

            // 送り仮名を含む語は、漢字部分だけにルビを付ける。
            if (
                term.customHtml
            ) {
                return term.customHtml;
            }

            return (
                `<ruby>${word}`
                + `<rt>${term.reading}</rt>`
                + `</ruby>`
            );
        }
    );
}

// ============================================================
// つながり説明
// ============================================================

function getRelationExplanation(
    book
) {

    if (
        book.assigned_relation
        === "shared_subject"
    ) {

        const theme =
            getCurrentTheme();

        const subject =
            makeRubyHtml(
                theme.display_subject
            );

        return (
            "「"
            + subject
            + "」という、おなじ"
            + "<ruby>話題<rt>わだい</rt></ruby>で"
            + "つながった"
            + "<ruby>本<rt>ほん</rt></ruby>だよ。"
        );
    }


    if (
        book.assigned_relation
        === "shared_ndc"
    ) {

        return (
            "<ruby>入口<rt>いりぐち</rt></ruby>の"
            + "<ruby>本<rt>ほん</rt></ruby>と、"
            + "おなじ"
            + "<ruby>本<rt>ほん</rt></ruby>だなの"
            + "なかまの"
            + "<ruby>本<rt>ほん</rt></ruby>だよ。"
        );
    }


    const path =
        book.best_concept_path;


    if (
        path
        && Array.isArray(
            path.path_nodes
        )
        && path.path_nodes.length > 1
    ) {

        const theme =
            getCurrentTheme();

        const displayPath =
            [...path.path_nodes];

        const lastNode =
            displayPath[
                displayPath.length - 1
            ];

        // 概念の道を「児童の言葉に近い側」から表示する。
        // 例：菓子 → 洋菓子 → チョコレート
        if (
            lastNode === theme.concept_start
            && displayPath[0] !== theme.concept_start
        ) {
            displayPath.reverse();
        }

        const startConcept =
            makeRubyHtml(
                displayPath[0]
            );

        const remainingPath =
            displayPath
                .slice(1)
                .map(
                    function (node) {
                        return (
                            "「"
                            + makeRubyHtml(node)
                            + "」"
                        );
                    }
                )
                .join(
                    " → "
                );


        return (
            "きみの"
            + "<ruby>言葉<rt>ことば</rt></ruby>に"
            + "<ruby>近<rt>ちか</rt></ruby>い"
            + "「"
            + startConcept
            + "」から、"
            + remainingPath
            + "とたどって、この"
            + "<ruby>本<rt>ほん</rt></ruby>を"
            + "<ruby>見<rt>み</rt></ruby>つけたよ。"
        );
    }


    return (
        "ことばのつながりをたどって、"
        + "つながった"
        + "<ruby>本<rt>ほん</rt></ruby>だよ。"
    );
}

// ============================================================
// 関連本カード
// ============================================================

function createBookCard(
    book
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "related-book-card";


    const img =
        document.createElement(
            "img"
        );


    img.src =
        "assets/covers/"
        + book.cover_file;


    img.alt =
        book.title
        + " の表紙";


    const title =
        document.createElement(
            "h3"
        );


    title.innerHTML =
        makeRubyHtml(
            book.title
        );


    

    card.appendChild(
        img
    );

    card.appendChild(
        title
    );

    

    card.addEventListener(
        "click",
        function () {

            openBookDetail(
                book
            );
        }
    );


    return card;
}


// ============================================================
// 本の説明を開く
// ============================================================

function openBookDetail(
    book
) {

    selectedBook =
        book;


    detailCover.src =
        "assets/covers/"
        + book.cover_file;


    detailCover.alt =
        book.title
        + " の表紙";


    detailTitle.innerHTML =
        makeRubyHtml(
            book.title
        );


    detailRelationLabel.innerHTML =
    getRelationLabel(
        book.assigned_relation
    );


detailExplanation.innerHTML =
    getRelationExplanation(
        book
    );

    relatedScreen.classList.add(
    "detail-open"
    );

    bookDetailPanel.classList.remove(
        "hidden"
    );


    addLog(
        "detail_event",
        {
            title:
                book.title,

            isbn:
                book.isbn,

            relation:
                book.assigned_relation,

            cosine_similarity:
                book.cosine_similarity
        }
    );
}


// ============================================================
// 説明を閉じる
// ============================================================

function closeBookDetail() {

    bookDetailPanel.classList.add(
        "hidden"
    );
    relatedScreen.classList.remove(
        "detail-open"
    );
}


// ============================================================
// 関連本表示
// ============================================================

function showRelatedBooks() {

    const assignment =
        getCurrentAssignment();

    const theme =
        getCurrentTheme();


    const books =
        assignment.condition === 3
            ? theme.condition_3
            : theme.condition_6;


    document
        .getElementById(
            "related-theme-number"
        )
        .textContent =
            currentStep + 1;


    document
        .getElementById(
            "related-entry-cover"
        )
        .src =
            "assets/covers/"
            + theme.entry_book.cover_file;


    document
        .getElementById(
            "related-entry-title"
        )
        .innerHTML =
            makeRubyHtml(
                theme.entry_book.title
            );


    const subjectArea =
        document.getElementById(
            "subject-books"
        );

    const ndcArea =
        document.getElementById(
            "ndc-books"
        );

    const conceptArea =
        document.getElementById(
            "concept-books"
        );


    subjectArea.innerHTML = "";
    ndcArea.innerHTML = "";
    conceptArea.innerHTML = "";


    for (
        const book of books
    ) {

        const card =
            createBookCard(
                book
            );


        if (
            book.assigned_relation
            === "shared_subject"
        ) {

            subjectArea.appendChild(
                card
            );

        } else if (
            book.assigned_relation
            === "shared_ndc"
        ) {

            ndcArea.appendChild(
                card
            );

        } else {

            conceptArea.appendChild(
                card
            );
        }
    }


    addLog(
        "displayed_nodes",
        {
            condition:
                assignment.condition,

            displayed_candidate_count:
                books.length,

            displayed_books:
                books.map(
                    function (
                        book
                    ) {

                        return {
                            title:
                                book.title,

                            isbn:
                                book.isbn,

                            relation:
                                book.assigned_relation,

                            cosine_similarity:
                                book.cosine_similarity
                        };
                    }
                )
        }
    );


    showScreen(
        relatedScreen
    );
}


// ============================================================
// 本を最終選択
// ============================================================

function chooseBook() {

    if (!selectedBook) {
        return;
    }


    addLog(
        "final_choice",
        {
            title:
                selectedBook.title,

            isbn:
                selectedBook.isbn,

            relation:
                selectedBook.assigned_relation
        }
    );


    closeBookDetail();


    showSurvey();
}


// ============================================================
// アンケート表示
// ============================================================

function showSurvey() {

    document
        .getElementById(
            "survey-theme-number"
        )
        .textContent =
            currentStep + 1;


    document
        .getElementById(
            "survey-cover"
        )
        .src =
            "assets/covers/"
            + selectedBook.cover_file;


    document
        .getElementById(
            "survey-book-title"
        )
        .innerHTML =
            makeRubyHtml(
                selectedBook.title
            );


    surveyError.textContent =
        "";


    const radios =
        document.querySelectorAll(
            'input[type="radio"]'
        );


    for (
        const radio of radios
    ) {

        radio.checked =
            false;
    }


    showScreen(
        surveyScreen
    );
}


// ============================================================
// アンケート回答
// ============================================================

function submitSurvey() {

    const reason =
        document.querySelector(
            'input[name="choice-reason"]:checked'
        );


    const amount =
        document.querySelector(
            'input[name="amount-feedback"]:checked'
        );


    if (
        !reason
        || !amount
    ) {

        surveyError.innerHTML =
    '2つの<ruby>質問<rt>しつもん</rt></ruby>に'
    + '<ruby>答<rt>こた</rt></ruby>えてね。';

        return;
    }


    addLog(
        "theme_feedback",
        {
            selected_title:
                selectedBook.title,

            selected_relation:
                selectedBook.assigned_relation,

            choice_reason:
                reason.value,

            amount_feedback:
                amount.value,

            condition:
                getCurrentAssignment().condition
        }
    );


    selectedBook =
        null;


    currentStep += 1;


    if (
        currentStep >= 4
    ) {

        showFinalSurvey();

        return;
    }


    showTask();
}


function showFinalSurvey() {

    finalSurveyError.textContent =
        "";

    const finalRadios =
        finalSurveyScreen.querySelectorAll(
            'input[type="radio"]'
        );

    for (
        const radio of finalRadios
    ) {
        radio.checked = false;
    }

    finalComment.value = "";

    showScreen(
        finalSurveyScreen
    );
}


function submitFinalSurvey() {

    const overallEase =
        document.querySelector(
            'input[name="overall-ease"]:checked'
        );

    const newInterest =
        document.querySelector(
            'input[name="new-interest"]:checked'
        );

    const preferredAmount =
        document.querySelector(
            'input[name="preferred-amount"]:checked'
        );

    const reuseIntention =
        document.querySelector(
            'input[name="reuse-intention"]:checked'
        );

    if (
        !overallEase
        || !newInterest
        || !preferredAmount
        || !reuseIntention
    ) {

        finalSurveyError.innerHTML =
            '4つの<ruby>質問<rt>しつもん</rt></ruby>に'
            + '<ruby>答<rt>こた</rt></ruby>えてね。';

        return;
    }


    addLog(
        "final_survey",
        {
            step:
                currentStep,

            overall_ease:
                Number(
                    overallEase.value
                ),

            new_interest:
                newInterest.value,

            preferred_amount:
                preferredAmount.value,

            reuse_intention:
                reuseIntention.value,

            comment:
                finalComment.value.trim()
        }
    );


    addLog(
        "experiment_complete",
        {
            step:
                currentStep,

            completed_theme_count:
                currentStep
        }
    );

    downloadExperimentLog();


    console.log(
        "実験ログ全体",
        experimentLog
    );


    showScreen(
        finishScreen
    );
}


// ============================================================
// ボタン
// ============================================================

document
    .getElementById(
        "start-button"
    )
    .addEventListener(
        "click",
        startExperiment
    );


document
    .getElementById(
        "show-entry-button"
    )
    .addEventListener(
        "click",
        showEntryBook
    );


document
    .getElementById(
        "show-related-button"
    )
    .addEventListener(
        "click",
        showRelatedBooks
    );


document
    .getElementById(
        "close-detail-button"
    )
    .addEventListener(
        "click",
        closeBookDetail
    );

document
    .getElementById(
        "back-to-books-button"
    )
    .addEventListener(
        "click",
        closeBookDetail
    );
document
    .getElementById(
        "choose-book-button"
    )
    .addEventListener(
        "click",
        chooseBook
    );


document
    .getElementById(
        "next-theme-button"
    )
    .addEventListener(
        "click",
        submitSurvey
    );


document
    .getElementById(
        "complete-button"
    )
    .addEventListener(
        "click",
        submitFinalSurvey
    );


downloadLogButton
    .addEventListener(
        "click",
        manuallyDownloadExperimentLog
    );


// ============================================================
// 最初にデータ読み込み
// ============================================================

if (!restoreCompletedExperiment()) {
    loadPilotData();
}
