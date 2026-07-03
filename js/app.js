async function fetchJSON(url, retries = 1, delay = 900){
  for(let attempt = 0; attempt <= retries; attempt++){
    try{
      const res = await fetch(url);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    }catch(err){
      if(attempt === retries) throw err;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// CANLI SAAT
function updateClock(){
  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  document.getElementById('clock').textContent =
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const days = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  document.getElementById('dateline').textContent =
    `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}
updateClock();
setInterval(updateClock, 1000);

// KRİPTO VERİLERİ (CoinGecko)
const COIN_IDS = ['bitcoin','ethereum','solana','ripple','dogecoin','cardano','polkadot','litecoin'];

async function loadCrypto(){
  try{
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COIN_IDS.join(',')}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`;
    const data = await fetchJSON(url);
    if(!Array.isArray(data)) throw new Error('unexpected response');
    renderCryptoGrid(data);
    renderTable(data);
    renderTicker(data);
  }catch(e){
    document.getElementById('cryptoGrid').innerHTML = '<div class="loading">Veri alınamadı. Lütfen daha sonra tekrar deneyin.</div>';
    document.getElementById('tableBody').innerHTML = '<tr><td colspan="6" class="loading">Veri alınamadı.</td></tr>';
  }
}

function renderTicker(data){
  const track = document.getElementById('tickerTrack');
  const items = data.map(c=>{
    const change = c.price_change_percentage_24h ?? 0;
    const up = change >= 0;
    return `<span class="tick-item"><span class="tick-sym">${c.symbol.toUpperCase()}</span> ${fmtPrice(c.current_price)} <span class="${up?'up':'down'}">${up?'▲':'▼'} ${Math.abs(change).toFixed(2)}%</span></span>`;
  }).join('');
  // duplicated so the scroll loop looks seamless
  track.innerHTML = items + items;
}

function fmtPrice(p){
  if(p >= 1) return '$' + p.toLocaleString('en-US',{maximumFractionDigits:2});
  return '$' + p.toLocaleString('en-US',{maximumFractionDigits:6});
}

function renderCryptoGrid(data){
  const grid = document.getElementById('cryptoGrid');
  grid.innerHTML = data.map(c=>{
    const change = c.price_change_percentage_24h ?? 0;
    const up = change >= 0;
    return `
      <div class="glass price-card">
        <div class="top-row">
          <div class="coin-name">
            <img src="${c.image}" alt="${c.symbol}">
            <div>${c.name}<div class="coin-sym">${c.symbol.toUpperCase()}</div></div>
          </div>
        </div>
        <div class="price">${fmtPrice(c.current_price)}</div>
        <div class="change ${up?'up':'down'}">
          ${up?'▲':'▼'} ${Math.abs(change).toFixed(2)}%
        </div>
      </div>
    `;
  }).join('');
}

function renderTable(data){
  const sorted = [...data].sort((a,b)=> (b.price_change_percentage_24h??0) - (a.price_change_percentage_24h??0));
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = sorted.map((c,i)=>{
    const change = c.price_change_percentage_24h ?? 0;
    const up = change >= 0;
    return `
      <tr>
        <td><span class="rank-badge">#${i+1}</span></td>
        <td>
          <div class="coin-cell">
            <img src="${c.image}" alt="${c.symbol}">
            ${c.name} <span style="color:var(--muted);font-weight:400;">(${c.symbol.toUpperCase()})</span>
          </div>
        </td>
        <td>${fmtPrice(c.current_price)}</td>
        <td class="${up?'up':'down'}">${up?'▲':'▼'} ${Math.abs(change).toFixed(2)}%</td>
        <td>${fmtPrice(c.low_24h)}</td>
        <td>${fmtPrice(c.high_24h)}</td>
      </tr>
    `;
  }).join('');
}

// DÖVİZ ÇEVİRİCİ (exchangerate-api açık uç, anahtarsız)
let rates = null;
let baseCurrency = 'USD';

const CURRENCIES = ['USD','EUR','TRY','GBP','JPY','CHF','CAD','AUD','CNY','RUB'];

function populateSelects(){
  const fromSel = document.getElementById('currencyFrom');
  const toSel = document.getElementById('currencyTo');
  CURRENCIES.forEach(c=>{
    fromSel.innerHTML += `<option value="${c}">${c}</option>`;
    toSel.innerHTML += `<option value="${c}">${c}</option>`;
  });
  fromSel.value = 'USD';
  toSel.value = 'TRY';
}

async function loadRates(){
  try{
    const data = await fetchJSON(`https://open.er-api.com/v6/latest/${baseCurrency}`);
    if(data.result === 'success'){
      rates = data.rates;
      document.getElementById('rateNote').textContent =
        `Kur güncelleme zamanı: ${data.time_last_update_utc}`;
      convert();
    }else{
      throw new Error('rates unavailable');
    }
  }catch(e){
    document.getElementById('convText').textContent = 'Kur verisi alınamadı.';
  }
}

async function convert(){
  const amount = parseFloat(document.getElementById('amountFrom').value) || 0;
  const from = document.getElementById('currencyFrom').value;
  const to = document.getElementById('currencyTo').value;

  if(from !== baseCurrency){
    baseCurrency = from;
    await loadRates();
    return;
  }

  if(!rates){ return; }
  const rate = rates[to];
  const result = amount * rate;
  document.getElementById('amountTo').value = result.toFixed(4);
  document.getElementById('convText').innerHTML =
    `${amount.toLocaleString('tr-TR')} ${from} = <b>${result.toLocaleString('tr-TR',{maximumFractionDigits:4})} ${to}</b>`;
}

document.getElementById('amountFrom').addEventListener('input', convert);
document.getElementById('currencyFrom').addEventListener('change', convert);
document.getElementById('currencyTo').addEventListener('change', convert);
document.getElementById('swapBtn').addEventListener('click', ()=>{
  const fromSel = document.getElementById('currencyFrom');
  const toSel = document.getElementById('currencyTo');
  const tmp = fromSel.value;
  fromSel.value = toSel.value;
  toSel.value = tmp;
  convert();
});

// GLOBAL PİYASA VERİLERİ
async function loadGlobalStats(){
  try{
    const json = await fetchJSON('https://api.coingecko.com/api/v3/global');
    const data = json.data;
    if(!data) throw new Error('unexpected response');
    const mcap = data.total_market_cap.usd;
    const vol = data.total_volume.usd;
    const btcDom = data.market_cap_percentage.btc;
    document.getElementById('statMcap').textContent = '$' + (mcap/1e12).toFixed(2) + 'T';
    document.getElementById('statVol').textContent = '$' + (vol/1e9).toFixed(1) + 'B';
    document.getElementById('statBtcDom').textContent = btcDom.toFixed(1) + '%';
    document.getElementById('statCoins').textContent = data.active_cryptocurrencies.toLocaleString('tr-TR');
  }catch(e){
    document.getElementById('statsBar').innerHTML = '<div class="loading">Global veri alınamadı.</div>';
  }
}

// KORKU & AÇGÖZLÜLÜK ENDEKSİ
async function loadFearGreed(){
  try{
    const json = await fetchJSON('https://api.alternative.me/fng/?limit=1');
    const item = json.data && json.data[0];
    if(!item) throw new Error('unexpected response');
    const value = parseInt(item.value);
    const classMap = {
      'Extreme Fear':'Aşırı Korku',
      'Fear':'Korku',
      'Neutral':'Nötr',
      'Greed':'Açgözlülük',
      'Extreme Greed':'Aşırı Açgözlülük'
    };
    document.getElementById('fngNum').textContent = value;
    document.getElementById('fngClass').textContent = classMap[item.value_classification] || item.value_classification;
    const circle = document.getElementById('fngCircle');
    const circumference = 364;
    const offset = circumference - (value/100)*circumference;
    circle.style.strokeDashoffset = offset;
    let color = '#F5C740';
    if(value <= 24) color = '#FF4D6D';
    else if(value <= 49) color = '#FF8A4E';
    else if(value <= 74) color = '#F5C740';
    else color = '#00FF9D';
    circle.setAttribute('stroke', color);
    document.getElementById('fngNum').style.color = color;
  }catch(e){
    document.getElementById('fngClass').textContent = 'Veri alınamadı';
  }
}

// TREND OLAN COİNLER
async function loadTrending(){
  try{
    const json = await fetchJSON('https://api.coingecko.com/api/v3/search/trending');
    if(!json.coins) throw new Error('unexpected response');
    const strip = document.getElementById('trendingStrip');
    strip.innerHTML = json.coins.slice(0,8).map((c,i)=>`
      <div class="trend-chip">
        <span class="rank">#${i+1}</span>
        <img src="${c.item.small}" alt="${c.item.symbol}">
        ${c.item.name} <span style="color:var(--muted);">(${c.item.symbol.toUpperCase()})</span>
      </div>
    `).join('');
  }catch(e){
    document.getElementById('trendingStrip').innerHTML = '<div class="loading">Trend veri alınamadı.</div>';
  }
}

// FİYAT GRAFİĞİ (Chart.js)
let priceChart = null;
let activeChartCoin = 'bitcoin';
let activeChartDays = 7;

function buildCoinSelector(){
  const sel = document.getElementById('coinSelector');
  sel.innerHTML = COIN_IDS.map(id=>{
    const label = id.charAt(0).toUpperCase()+id.slice(1);
    return `<button class="coin-chip-btn ${id==='bitcoin'?'active':''}" data-coin="${id}">${label}</button>`;
  }).join('');
  sel.querySelectorAll('.coin-chip-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      sel.querySelectorAll('.coin-chip-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      activeChartCoin = btn.dataset.coin;
      loadPriceChart();
    });
  });
  document.querySelectorAll('.range-selector .range-btn').forEach(btn=>{
    if(btn.classList.contains('fx-range')) return;
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.range-selector .range-btn:not(.fx-range)').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      activeChartDays = btn.dataset.days;
      loadPriceChart();
    });
  });
}

async function loadPriceChart(){
  try{
    const url = `https://api.coingecko.com/api/v3/coins/${activeChartCoin}/market_chart?vs_currency=usd&days=${activeChartDays}`;
    const data = await fetchJSON(url);
    const points = data.prices || [];
    if(!points.length) throw new Error('no data');
    const labels = points.map(p=>{
      const d = new Date(p[0]);
      return activeChartDays == 1 ? d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'}) : d.toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit'});
    });
    const values = points.map(p=>p[1]);
    const trendUp = values[values.length-1] >= values[0];
    const color = trendUp ? '#00FF9D' : '#FF4D6D';

    const ctx = document.getElementById('priceChart').getContext('2d');
    if(priceChart) priceChart.destroy();
    priceChart = new Chart(ctx, {
      type:'line',
      data:{
        labels,
        datasets:[{
          data: values,
          borderColor: color,
          backgroundColor: color+'22',
          borderWidth:2,
          fill:true,
          tension:0.3,
          pointRadius:0,
          pointHoverRadius:4,
        }]
      },
      options:{
        responsive:true,
        maintainAspectRatio:false,
        interaction:{ mode:'index', intersect:false },
        plugins:{
          legend:{display:false},
          tooltip:{
            enabled:true,
            backgroundColor:'#0c1119',
            borderColor:'rgba(255,255,255,0.1)',
            borderWidth:1,
            titleColor:'#8B96A8',
            bodyColor:'#E8ECF3',
            padding:10,
            displayColors:false,
            callbacks:{
              label: ctx => '$' + ctx.parsed.y.toLocaleString('en-US',{maximumFractionDigits: ctx.parsed.y >= 1 ? 2 : 6})
            }
          }
        },
        scales:{
          x:{ grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#8B96A8', maxTicksLimit:8} },
          y:{ grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#8B96A8'} }
        }
      }
    });
  }catch(e){
    console.error('Grafik yüklenemedi', e);
    const container = document.getElementById('priceChart').closest('.chart-container');
    container.innerHTML = '<div class="loading">Fiyat grafiği şu anda alınamadı. Lütfen tekrar deneyin.</div>';
  }
}

// DÖVİZ KURU GEÇMİŞİ (frankfurter.dev)
let fxChart = null;
let activeFxPair = {from:'USD', to:'TRY'};
let activeFxDays = 30;
const FX_PAIRS = [
  {from:'USD',to:'TRY'},
  {from:'EUR',to:'TRY'},
  {from:'GBP',to:'TRY'},
  {from:'EUR',to:'USD'}
];

function buildFxSelector(){
  const sel = document.getElementById('fxPairSelector');
  sel.innerHTML = FX_PAIRS.map((p,i)=>`
    <button class="coin-chip-btn ${i===0?'active':''}" data-from="${p.from}" data-to="${p.to}">${p.from}/${p.to}</button>
  `).join('');
  sel.querySelectorAll('.coin-chip-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      sel.querySelectorAll('.coin-chip-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      activeFxPair = {from:btn.dataset.from, to:btn.dataset.to};
      loadFxChart();
    });
  });
  document.querySelectorAll('.fx-range').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.fx-range').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      activeFxDays = parseInt(btn.dataset.days);
      loadFxChart();
    });
  });
}

async function loadFxChart(){
  try{
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - activeFxDays);
    const fmt = d => d.toISOString().split('T')[0];
    const url = `https://api.frankfurter.dev/v1/${fmt(start)}..${fmt(end)}?from=${activeFxPair.from}&to=${activeFxPair.to}`;
    const data = await fetchJSON(url);
    if(!data.rates || !Object.keys(data.rates).length) throw new Error('no data');
    const entries = Object.entries(data.rates).sort((a,b)=> new Date(a[0]) - new Date(b[0]));
    const labels = entries.map(([date])=> new Date(date).toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit'}));
    const values = entries.map(([,r])=> r[activeFxPair.to]);
    const trendUp = values[values.length-1] >= values[0];
    const color = trendUp ? '#00FF9D' : '#FF4D6D';

    const ctx = document.getElementById('fxChart').getContext('2d');
    if(fxChart) fxChart.destroy();
    fxChart = new Chart(ctx, {
      type:'line',
      data:{
        labels,
        datasets:[{
          data: values,
          borderColor: color,
          backgroundColor: color+'22',
          borderWidth:2,
          fill:true,
          tension:0.3,
          pointRadius:0,
          pointHoverRadius:4,
        }]
      },
      options:{
        responsive:true,
        maintainAspectRatio:false,
        interaction:{ mode:'index', intersect:false },
        plugins:{
          legend:{display:false},
          tooltip:{
            enabled:true,
            backgroundColor:'#0c1119',
            borderColor:'rgba(255,255,255,0.1)',
            borderWidth:1,
            titleColor:'#8B96A8',
            bodyColor:'#E8ECF3',
            padding:10,
            displayColors:false,
            callbacks:{
              label: ctx => ctx.parsed.y.toLocaleString('tr-TR',{maximumFractionDigits:4})
            }
          }
        },
        scales:{
          x:{ grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#8B96A8', maxTicksLimit:8} },
          y:{ grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#8B96A8'} }
        }
      }
    });
  }catch(e){
    console.error('Kur grafiği yüklenemedi', e);
    const container = document.getElementById('fxChart').closest('.chart-container');
    container.innerHTML = '<div class="loading">Kur geçmişi şu anda alınamadı. Lütfen tekrar deneyin.</div>';
  }
}

// INIT
populateSelects();
loadRates();
loadCrypto();
buildCoinSelector();
buildFxSelector();

// Hepsinin aynı anda çıkmaması için CoinGecko çağrıları için küçük bir timeout
setTimeout(loadGlobalStats, 300);
setTimeout(loadTrending, 600);
setTimeout(loadPriceChart, 900);
setTimeout(loadFxChart, 1200);
setTimeout(loadFearGreed, 1500);

setInterval(loadCrypto, 30000);
setInterval(loadRates, 30000);
setInterval(loadGlobalStats, 90000);
setInterval(loadFearGreed, 300000);
setInterval(loadTrending, 300000);

// Yukarı Çıkma Butonu
const scrollFab = document.getElementById('scrollFab');
window.addEventListener('scroll', ()=>{
  if(window.scrollY > 420) scrollFab.classList.add('show');
  else scrollFab.classList.remove('show');
});
function scrollToTop(){ window.scrollTo({top:0, behavior:'smooth'}); }
scrollFab.addEventListener('click', scrollToTop);
document.getElementById('scrollTopBottom').addEventListener('click', scrollToTop);

/* Footer Yıl */
document.getElementById('footerYear').textContent = new Date().getFullYear();
