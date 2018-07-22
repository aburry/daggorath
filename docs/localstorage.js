function localStoragePort(elmApp) {
  elmApp.ports.saveCmd.subscribe(function (arg) {
    var [name, model] = arg;
    localStorage.setItem(name, JSON.stringify(model));
  });

  elmApp.ports.loadCmd.subscribe(function (arg) {
    const obj = localStorage.getItem(arg);
    const pobj = obj ? JSON.parse(obj) : null;
    if (pobj==null) {
      elmApp.ports.errorSub.send("Cannot restore '" + arg + "'.");
    } else {
      elmApp.ports.loadSub.send(pobj);
    }
  });
}
