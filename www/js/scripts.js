"use strict";angular.module("cnodejs.config",[]).constant("$ionicLoadingConfig",{template:"请求中..."}).constant("ENV",{version:"1.1.2",name:"production",debug:!1,api:"https://cnodejs.org/api/v1"}),angular.module("cnodejs",["ionic","angularMoment","cnodejs.controllers","cnodejs.filters","cnodejs.directives","cnodejs.config"]).run(["$ionicPlatform","$log","$timeout","amMoment","ENV",function(a,b,c,d,e){d.changeLocale("zh-cn"),navigator.notification||(navigator.notification={alert:function(a){window.alert(a)}}),a.ready(function(){window.cordova&&(window.analytics&&"production"===e.name&&window.analytics.startTrackerWithId("UA-57246029-1"),window.cordova.plugins.Keyboard&&(cordova.plugins.Keyboard.hideKeyboardAccessoryBar(!0),cordova.plugins.Keyboard.disableScroll(!0)),window.cordova.plugins.notification.badge&&c(function(){cordova.plugins.notification.badge.promptForPermission()},100)),navigator.splashscreen?c(function(){navigator.splashscreen.hide()},100):b.debug("no splash screen plugin")})}]).config(["ENV","$stateProvider","$urlRouterProvider","$logProvider",function(a,b,c,d){d.debugEnabled(a.debug),b.state("app",{url:"","abstract":!0,templateUrl:"templates/menu.html",controller:"AppCtrl"}).state("app.user",{url:"/user/:loginname",views:{menuContent:{templateUrl:"templates/user.html",controller:"UserCtrl"}}}).state("app.messages",{url:"/my/messages",views:{menuContent:{templateUrl:"templates/messages.html",controller:"MessagesCtrl"}}}).state("app.topics",{url:"/topics/:tab",views:{menuContent:{templateUrl:"templates/topics.html",controller:"TopicsCtrl"}}}).state("app.topic",{url:"/topic/:id",views:{menuContent:{templateUrl:"templates/topic.html",controller:"TopicCtrl"}}}).state("app.settings",{url:"/settings",views:{menuContent:{templateUrl:"templates/settings.html",controller:"SettingsCtrl"}}}),c.otherwise("/topics/all")}]),angular.module("cnodejs.controllers",["cnodejs.services"]),angular.module("cnodejs.services",["ngResource","cnodejs.config"]),angular.module("cnodejs.filters",["cnodejs.services"]),angular.module("cnodejs.directives",[]),angular.module("cnodejs.controllers").controller("AppCtrl",["ENV","$scope","$log","$timeout","$rootScope","$ionicPopup","$ionicLoading","Tabs","User","Messages","Settings",function(a,b,c,d,e,f,g,h,i,j,k){c.log("app ctrl");var l=function(){j.getMessageCount().$promise.then(function(a){b.messagesCount=a.data,o(b.messagesCount)},function(a){c.log("get messages count fail",a)})};b.ENV=a,b.platform=ionic.Platform;var m=i.getCurrentUser();b.loginName=m.loginname||null,null!==b.loginName&&l(),b.settings=k.getSettings();var n={0:"网络出错啦，请再试一下","wrong accessToken":"授权失败"};e.requestErrorHandler=function(a,b){return function(c){var d;d=c.data&&c.data.error_msg?n[c.data.error_msg]:n[c.status]||"Error: "+c.status+" "+c.statusText;var e=a||{};return angular.extend(e,{template:d,duration:1e3}),g.show(e),b&&b()}};var o=function(a){window.cordova&&window.cordova.plugins.notification.badge&&cordova.plugins.notification.badge.hasPermission(function(b){c.debug("Permission has been granted: "+b),b&&cordova.plugins.notification.badge.set(a)})};document.addEventListener("resume",function(){c.log("app on resume"),l()},!1),e.$on("logout",function(){c.debug("logout broadcast handle"),b.loginName=null,o(0)}),e.$on("messagesMarkedAsRead",function(){c.debug("message marked as read broadcast handle"),b.messagesCount=j.currentMessageCount(),o(b.messagesCount)});var p=function(a){g.hide(),b.loginName=a.loginname,l(),plugins&&plugins.jPushPlugin&&plugins.jPushPlugin.setAlias(b.loginName)};b.onHoldLogin=function(){b.processing=!0,window.cordova&&window.cordova.plugins.clipboard?(cordova.plugins.clipboard.paste(function(a){b.processing=!1,a?(c.log("get Access Token",a),g.show(),i.login(a).$promise.then(p,e.requestErrorHandler())):g.show({noBackdrop:!0,template:"粘贴板无内容",duration:1e3})}),window.analytics&&window.analytics.trackEvent("User","clipboard login")):c.debug("no clipboad plugin")},b.tabs=h,b.login=function(){if(!b.processing)if(window.cordova&&window.cordova.plugins.barcodeScanner)var c=f.show({template:"PC端登录cnodejs.org后，扫描设置页面的Access Token二维码即可完成登录",title:"扫码登录",scope:b,buttons:[{text:"<b>我知道了</b>",type:"button-positive",onTap:function(a){a.preventDefault(),c.close(),q()}}]});else if(a.debug)g.show(),i.login(a.accessToken).$promise.then(p,e.requestErrorHandler());else{b.data={};var d=f.show({template:'<input type="text" ng-model="data.token">',title:"输入Access Token",scope:b,buttons:[{text:"取消"},{text:"<b>提交</b>",type:"button-positive",onTap:function(a){a.preventDefault(),b.data.token&&i.login(b.data.token).$promise.then(function(a){d.close(),p(a)},e.requestErrorHandler())}}]})}};var q=function(){b.processing=!0,d(function(){b.processing=!1},500),cordova.plugins.barcodeScanner.scan(function(a){b.processing=!1,a.cancelled||(c.log("get Access Token",a.text),g.show(),i.login(a.text).$promise.then(p,e.requestErrorHandler()))},function(a){b.processing=!1,g.show({noBackdrop:!0,template:"Scanning failed: "+a,duration:1e3})}),window.analytics&&window.analytics.trackEvent("User","scan login")}}]),angular.module("cnodejs.controllers").controller("TopicsCtrl",["$scope","$rootScope","$stateParams","$ionicLoading","$ionicModal","$timeout","$state","$location","$log","Topics","Tabs",function(a,b,c,d,e,f,g,h,i,j,k){i.debug("topics ctrl",c),a.$on("$ionicView.beforeEnter",function(){window.analytics&&window.analytics.trackView("topics view")}),a.currentTab=j.currentTab(),c.tab!==j.currentTab()&&(a.currentTab=j.currentTab(c.tab),j.resetData()),a.topics=j.getTopics(),a.hasNextPage=j.hasNextPage(),a.loadError=!1,i.debug("page load, has next page ? ",a.hasNextPage),a.doRefresh=function(){j.currentTab(c.tab),i.debug("do refresh"),j.refresh().$promise.then(function(b){i.debug("do refresh complete"),a.topics=b.data,a.hasNextPage=!0,a.loadError=!1},b.requestErrorHandler({noBackdrop:!0},function(){a.loadError=!0})).finally(function(){a.$broadcast("scroll.refreshComplete")})},a.loadMore=function(){i.debug("load more"),j.pagination().$promise.then(function(b){i.debug("load more complete"),a.hasNextPage=!1,a.loadError=!1,f(function(){a.hasNextPage=j.hasNextPage(),i.debug("has next page ? ",a.hasNextPage)},100),a.topics=a.topics.concat(b.data)},b.requestErrorHandler({noBackdrop:!0},function(){a.loadError=!0})).finally(function(){a.$broadcast("scroll.infiniteScrollComplete")})},e.fromTemplateUrl("templates/newTopic.html",{tabs:k,scope:a}).then(function(b){a.newTopicModal=b}),a.newTopicData={tab:"share",title:"",content:""},a.newTopicId,a.saveNewTopic=function(){i.debug("new topic data:",a.newTopicData),d.show(),j.saveNewTopic(a.newTopicData).$promise.then(function(b){d.hide(),a.newTopicId=b.topic_id,a.closeNewTopicModal(),f(function(){g.go("app.topic",{id:a.newTopicId}),f(function(){a.doRefresh()},300)},300)},b.requestErrorHandler)},a.$on("modal.hidden",function(){a.newTopicId&&f(function(){h.path("/app/topic/"+a.newTopicId)},300)}),a.showNewTopicModal=function(){window.analytics&&window.analytics.trackView("new topic view"),window.StatusBar&&StatusBar.styleDefault(),a.newTopicModal.show()},a.closeNewTopicModal=function(){window.StatusBar&&StatusBar.styleLightContent(),a.newTopicModal.hide()}}]),angular.module("cnodejs.controllers").controller("TopicCtrl",["$scope","$rootScope","$stateParams","$timeout","$ionicLoading","$ionicActionSheet","$ionicScrollDelegate","$log","Topics","Topic","User",function(a,b,c,d,e,f,g,h,i,j,k){h.debug("topic ctrl",c);var l=c.id,m=i.getById(l);a.topic=m,a.$on("$ionicView.beforeEnter",function(){window.analytics&&window.analytics.trackView("topic view")}),a.loadTopic=function(c){var d;return d=c===!0?j.get(l):j.getById(l),d.$promise.then(function(b){a.topic=b.data},b.requestErrorHandler({noBackdrop:!0},function(){a.loadError=!0}))},a.loadTopic(),a.doRefresh=function(){return a.loadTopic(!0).then(function(){h.debug("do refresh complete")},function(){}).finally(function(){a.$broadcast("scroll.refreshComplete")})},a.replyData={content:""},a.saveReply=function(){h.debug("new reply data:",a.replyData),e.show(),j.saveReply(l,a.replyData).$promise.then(function(b){e.hide(),a.replyData.content="",h.debug("post reply response:",b),a.loadTopic(!0).then(function(){g.scrollBottom()})},b.requestErrorHandler)},a.showActions=function(c){var g=k.getCurrentUser();if(void 0!==g.loginname&&g.loginname!==c.author.loginname){h.debug("action reply:",c);var i="赞";-1!==c.ups.indexOf(g.id)&&(i="已赞");var l="@"+c.author.loginname;f.show({buttons:[{text:"回复"},{text:i}],titleText:l,cancel:function(){},buttonClicked:function(f){return 0===f&&(a.replyData.content=l+" ",a.replyData.reply_id=c.id,d(function(){document.querySelector(".reply-new input").focus()},1)),1===f&&j.upReply(c.id).$promise.then(function(a){h.debug("up reply response:",a),e.show({noBackdrop:!0,template:"up"===a.action?"点赞成功":"点赞已取消",duration:1e3})},b.requestErrorHandler({noBackdrop:!0})),!0}})}}}]),angular.module("cnodejs.controllers").controller("UserCtrl",["$scope","$rootScope","$log","$stateParams","$state","User",function(a,b,c,d,e,f){c.log("user ctrl");var g=d.loginname;a.$on("$ionicView.beforeEnter",function(){window.analytics&&window.analytics.trackView("user view")}),f.getByLoginName(g).$promise.then(function(b){a.user=b.data});var h=f.getCurrentUser();g===h.loginname&&f.get(g).$promise.then(function(b){a.user=b.data}),a.logout=function(){c.debug("logout button action"),f.logout(),b.$broadcast("logout"),window.analytics&&window.analytics.trackEvent("User","logout")}}]),angular.module("cnodejs.controllers").controller("MessagesCtrl",["$scope","$log","$stateParams","$rootScope","Messages",function(a,b,c,d,e){b.log("messages ctrl"),a.$on("$ionicView.beforeEnter",function(){window.analytics&&window.analytics.trackView("messages view")}),e.getMessages().$promise.then(function(c){a.messages=c.data,a.messages.hasnot_read_messages.length>0&&e.markAll().$promise.then(function(a){b.debug("mark all response:",a),a.success&&d.$broadcast("messagesMarkedAsRead")},function(a){b.debug("mark all response error:",a)})},function(a){b.debug("get messages response error:",a)})}]),angular.module("cnodejs.controllers").controller("SettingsCtrl",["$scope","$log","ENV","Settings",function(a,b,c,d){b.log("settings ctrl"),a.$on("$ionicView.beforeEnter",function(){window.analytics&&window.analytics.trackView("settings view")}),a.now=new Date;var e="hi@lanceli.com",f="CNodeJs Feedback v"+c.version;a.feedback=function(){window.cordova&&window.cordova.plugins.email?window.cordova.plugins.email.open({to:e,subject:f,body:""}):window.open("mailto:"+e+"?subject="+f)},a.$on("$stateChangeStart",function(){b.debug("settings controller on $stateChangeStart"),d.save()})}]),angular.module("cnodejs.services").factory("Tabs",function(){return[{value:"all",label:"最新"},{value:"share",label:"分享"},{value:"ask",label:"问答"},{value:"job",label:"招聘"},{value:void 0,label:"其他"}]}),angular.module("cnodejs.services").factory("Topic",["ENV","$resource","$log","$q","User","Settings",function(a,b,c,d,e,f){var g,h=b(a.api+"/topic/:id",{id:"@id"},{reply:{method:"post",url:a.api+"/topic/:topicId/replies"},upReply:{method:"post",url:a.api+"/reply/:replyId/ups"}});return{getById:function(a){if(void 0!==g&&g.id===a){var b=d.defer();return b.resolve({data:g}),{$promise:b.promise}}return this.get(a)},get:function(a){return h.get({id:a},function(a){g=a.data})},saveReply:function(a,b){var c=angular.extend({},b),d=e.getCurrentUser();return f.getSettings().sendFrom&&(c.content=b.content+"\n 发自 CNodeJs ionic"),h.reply({topicId:a,accesstoken:d.accesstoken},c)},upReply:function(a){var b=e.getCurrentUser();return h.upReply({replyId:a,accesstoken:b.accesstoken},null,function(b){b.success&&angular.forEach(g.replies,function(c){c.id===a&&("up"===b.action?c.ups.push(""):c.ups.pop())})})}}}]),angular.module("cnodejs.services").factory("Topics",["ENV","$resource","$log","User",function(a,b,c,d){var e=[],f="all",g=1,h=!0,i=b(a.api+"/topics",{},{query:{method:"get",params:{tab:"all",page:1,limit:10,mdrender:!0},timeout:2e4}}),j=function(a,b,d){return i.query({tab:a,page:b},function(e){return c.debug("get topics tab:",a,"page:",b,"data:",e.data),d&&d(e)})};return{refresh:function(){return j(f,1,function(a){g=2,h=!0,e=a.data})},pagination:function(){return j(f,g,function(a){a.data.length<10&&(c.debug("response data length",a.data.length),h=!1),g++,e=e.concat(a.data)})},currentTab:function(a){return"undefined"!=typeof a&&(f=a),f},hasNextPage:function(a){return"undefined"!=typeof a&&(h=a),h},resetData:function(){e=[],g=1,h=!0},getTopics:function(){return e},getById:function(a){if(!e)return null;for(var b=0;b<e.length;b++)if(e[b].id===a)return e[b]},saveNewTopic:function(a){var b=d.getCurrentUser();return i.save({accesstoken:b.accesstoken},a)}}}]),angular.module("cnodejs.services").factory("User",["ENV","$resource","$log","$q","Storage",function(a,b,c,d,e){var f="user",g=b(a.api+"/accesstoken"),h=b(a.api+"/user/:loginname",{loginname:""}),i=e.get(f)||{};return{login:function(a){var b=this;return g.save({accesstoken:a},null,function(d){c.debug("post accesstoken:",d),i.accesstoken=a,b.getByLoginName(d.loginname).$promise.then(function(b){i=b.data,i.id=d.id,i.accesstoken=a,e.set(f,i)}),i.loginname=d.loginname})},logout:function(){i={},e.remove(f)},getCurrentUser:function(){return c.debug("current user:",i),i},getByLoginName:function(a){if(i&&a===i.loginname){var b=d.defer();return c.debug("get user info from storage:",i),b.resolve({data:i}),{$promise:b.promise}}return this.get(a)},get:function(a){return h.get({loginname:a},function(b){if(c.debug("get user info:",b),i&&i.loginname===a){var d=i.accesstoken;i=b.data,i.accesstoken=d,e.set(f,i)}})}}}]),angular.module("cnodejs.services").factory("Messages",["ENV","$resource","$log","User",function(a,b,c,d){var e=0,f=b(a.api+"/messages",null,{count:{method:"get",url:a.api+"/message/count"},markAll:{method:"post",url:a.api+"/message/mark_all"}});return{currentMessageCount:function(){return e},getMessageCount:function(){c.debug("get messages count");var a=d.getCurrentUser();return f.count({accesstoken:a.accesstoken})},getMessages:function(){c.debug("get messages");var a=d.getCurrentUser();return f.get({accesstoken:a.accesstoken})},markAll:function(){c.debug("mark all as read");var a=d.getCurrentUser();return f.markAll({accesstoken:a.accesstoken},function(a){c.debug("marked messages as read:",a),e=0})}}}]),angular.module("cnodejs.services").factory("Settings",["ENV","$resource","$log","Storage",function(a,b,c,d){var e="settings",f=d.get(e)||{sendFrom:!0,saverMode:!0};return{getSettings:function(){return c.debug("get settings",f),f},save:function(){d.set(e,f)}}}]),angular.module("cnodejs.services").factory("Storage",["ENV","$log",function(){return{set:function(a,b){return window.localStorage.setItem(a,window.JSON.stringify(b))},get:function(a){return window.JSON.parse(window.localStorage.getItem(a))},remove:function(a){return window.localStorage.removeItem(a)}}}]),angular.module("cnodejs.filters").filter("link",["$sce",function(a){return function(b){if("string"==typeof b){var c=/href="\/user\/([\S]+)"/gi,d=/src="\/\/([\S]+)"/gi,e=/href="((?!#\/user\/)[\S]+)"/gi;return a.trustAsHtml(b.replace(c,'href="#/user/$1"').replace(d,'src="https://$1"').replace(e,"onClick=\"window.open('$1', '_blank', 'location=yes')\""))}return b}}]).filter("tabName",["Tabs",function(a){return function(b){for(var c in a)if(a[c].value===b)return a[c].label}}]).filter("protocol",function(){return function(a){return/^\/\//gi.test(a)?"https:"+a:a}}),angular.module("cnodejs.directives").directive("resetImg",["$document",function(){return{restrict:"A",link:function(a,b,c){var d=function(a){var c=b.clone(!0);c.attr("src",a),b.replaceWith(c),b=c};c.$observe("src",d),c.$observe("ngSrc",d)}}}]);