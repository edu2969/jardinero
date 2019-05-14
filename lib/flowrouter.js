FlowRouter.route('/panel', {
  name: 'panel', 
  subscriptions: function() {
    this.register('logs', Meteor.subscribe('logs'));
    this.register('config', Meteor.subscribe('config'));
    this.register('plantas', Meteor.subscribe('plantas'));
  },
  action() {
    DocHead.setTitle("¯`·._.· Jardinero ·._.·´¯");
    DocHead.addMeta({name: "description", content: "TI y Mejora continua"});
    DocHead.addMeta({name: "viewport", content: "user-scalable=no, initial-scale=1, minimal-ui, maximum-scale=1, minimum-scale=1"});
    DocHead.addLink({rel: "shortcut icon", href: "/favicon/favicon.ico"});
    BlazeLayout.render('PanelLayout', { contenido: "panel" });
  }
});

FlowRouter.route('/', {
  name: 'login', 
  subscriptions: function() {    
  },
  action() {
    DocHead.setTitle("¯`·._.· Jardinero ·._.·´¯");
    DocHead.addMeta({name: "description", content: "TI y Mejora continua"});
    DocHead.addMeta({name: "viewport", content: "user-scalable=no, initial-scale=1, minimal-ui, maximum-scale=1, minimum-scale=1"});
    DocHead.addLink({rel: "shortcut icon", href: "/favicon/favicon.ico"});
    BlazeLayout.render('PanelLayout', { contenido: "login" });
  }
});