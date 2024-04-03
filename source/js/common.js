(function () {
  console.log(" ......................阿弥陀佛......................\n"+
  "                       _oo0oo_                      \n"+
  "                      o8888888o                     \n"+
  "                      88\" . \"88                     \n"+
  "                      (| -_- |)                     \n"+
  "                      0\\  =  /0                     \n"+
  "                   ___/‘---’\\___                   \n"+
  "                  .' \\|       |/ '.                 \n"+
  "                 / \\\\|||  :  |||// \\                \n"+
  "                / _||||| -卍-|||||_ \\               \n"+
  "               |   | \\\\\\  -  /// |   |              \n"+
  "               | \\_|  ''\\---/''  |_/ |              \n"+
  "               \\  .-\\__  '-'  ___/-. /              \n"+
  "             ___'. .'  /--.--\\  '. .'___            \n"+
  "         .\"\" ‘<  ‘.___\\_<|>_/___.’>’ \"\".          \n"+
  "       | | :  ‘- \\‘.;‘\\ _ /’;.’/ - ’ : | |        \n"+
  "         \\  \\ ‘_.   \\_ __\\ /__ _/   .-’ /  /        \n"+
  "    =====‘-.____‘.___ \\_____/___.-’___.-’=====     \n"+
  "                       ‘=---=’                      \n"+
  "                                                    \n"+
  "....................佛祖保佑 ,永无BUG...................")
  function initEruda() {
    if (!/eruda=true/.test(window.location) && localStorage.getItem('active-eruda') != 'true') return;
    var script = document.createElement('script');
    script.src="https://cdn.bootcdn.net/ajax/libs/eruda/3.0.0/eruda.min.js";
    document.body.appendChild(script);
    script.onload = function () {
      eruda.init()
      eruda.get('console').config.set('catchGlobalErr', true)
    }
  }
  function getDistance(e, t, n, o) {
    const {sin: a, cos: s, asin: i, PI: c, hypot: r} = Math;
    let l = (e,t)=>(e *= c / 180,
    {
        x: s(t *= c / 180) * s(e),
        y: s(t) * a(e),
        z: a(t)
    })
      , d = l(e, t)
      , b = l(n, o)
      , u = 2 * i(r(d.x - b.x, d.y - b.y, d.z - b.z) / 2) * 6371;
    return Math.round(u)
  }
  function getIpInfo() {
    if(!typeof jQuery) return
    $.ajax({
      type: 'get',
      url: 'https://apis.map.qq.com/ws/location/v1/ip',
      data: {
        key: 'H37BZ-YZDKB-Z7NU6-JVYTI-BY2K2-G4FHH',
        output: 'jsonp'
      },
      dataType: 'jsonp',
      success: function(res) {
        let { result = {} } = res
        if(result && result.location) {
          let distance = getDistance(113.88308, 22.55329, result.location.lng, result.location.lat)
          // this.ip = result.ip
          $('.welcome .local-ip').text(result.ip)
          $('.welcome .ad-info').text(result.ad_info.province + result.ad_info.city + result.ad_info.district)
          $('.welcome .distance').text(distance)
        }
      }
    })
  }
  initEruda()
  getIpInfo()
  let curHour = new Date().getHours()
  let mode = volantis.dark.mode
  if(curHour >= 18 || curHour <= 7) {
    if(mode === 'light') {
      volantis.dark.toggle()
    }
  } else {
    if(mode === 'dark') {
      volantis.dark.toggle()
    }
  }
})()
