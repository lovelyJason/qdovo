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
  if (!/eruda=true/.test(window.location) && localStorage.getItem('active-eruda') != 'true') return;
  var script = document.createElement('script');
  script.src="https://cdn.bootcdn.net/ajax/libs/eruda/3.0.0/eruda.min.js";
  document.body.appendChild(script);
  script.onload = function () { 
    eruda.init()
    eruda.get('console').config.set('catchGlobalErr', true)
  }
})()