// 《已讀》互動試玩劇本資料（照 Godot 專案 story_nodes.json 結構重寫之全年齡示範版）
window.STORY = {
  who: '阿遙',
  openings: {
    none:  { img: 'assets/read-open.webp',    text: '一則新訊息。' },
    meet:  { img: 'assets/read-station.webp', text: '她說，下個月還會再來台北。' },
    miss:  { img: 'assets/read-night.webp',   text: '那天之後，對話停在你的最後一句。' },
    read:  { img: 'assets/read-alley.webp',   text: '已讀。三天了。' },
  },
  start: 'n1',
  nodes: {
    n1: {
      img: 'assets/read-station.webp',
      msgs: ['好久不見', '我今天到台北出差', '你還住這附近嗎？'],
      text_variants: [
        { when: 'meet', msg: '又是我 (・ω・)' },
        { when: 'read', msg: '……你還在嗎？' },
      ],
      choices: [
        { label: '還在，怎麼了？', near: 1, next: 'n2' },
        { label: '搬走了，最近很忙', far: 1, next: 'n2' },
      ],
    },
    n2: {
      img: 'assets/read-station.webp',
      msgs: ['我在車站', '晚上沒事', '要不要吃個東西？'],
      choices: [
        { label: '夜市？我請你', near: 1, next: 'n3' },
        { label: '改天吧，今天有點累', far: 2, next: 'n3b' },
      ],
    },
    n3: {
      img: 'assets/read-market.webp',
      msgs: ['珍奶還是一樣甜', '你都沒變欸'],
      choices: [
        { label: '你倒是變了不少', near: 1, next: 'n4' },
        { label: '我們好像不太熟了', far: 1, next: 'n4' },
      ],
    },
    n3b: {
      img: 'assets/read-night.webp',
      msgs: ['好喔', '那我自己逛逛'],
      choices: [
        { label: '到家跟我說一聲', near: 1, next: 'n4' },
        { label: '（已讀）', far: 1, next: 'n4', silent: true },
      ],
    },
    n4: {
      img: 'assets/read-street.webp',
      msgs: ['其實我有件事想跟你說'],
      choices: [
        { label: '你說，我在聽', requires: 'near >= 2', next: 'n5' },
        { label: '明天再說吧', next: 'auto' },
      ],
    },
    n5: {
      img: 'assets/read-alley.webp',
      msgs: ['我下個月調回台北了', '到時候還找你，可以嗎？'],
      choices: [
        { label: '當然', next: 'meet' },
        { label: '再看看吧', next: 'miss' },
      ],
    },
  },
  auto: (s) => (s.far >= 3 ? 'read' : 'miss'),
  endings: {
    meet: { title: '下個月見', text: '對話框停在一個貼圖。這次換你先傳。' },
    miss: { title: '錯過', text: '你們都沒有再開口。也不是誰的錯。' },
    read: { title: '已讀', text: '訊息旁邊的「已讀」，比任何一句話都清楚。' },
  },
};
