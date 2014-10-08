if (Meteor.isClient) {

	Router.configure({
		layoutTemplate: 'content',
		//loadingTemplate: 'loading',
		before: function(){
			//NProgress.start()
		},
		after: function(){
			//NProgress.done()
			//GAnalytics.pageview()
		}
	});
	
	Router.onBeforeAction('loading')
	
	Router.map(function() {
	  	this.route('home', {
  			path: '/', waitOn: function(){ 
  				
  			},
  			data: function() { 
  				return {
  					
  				}
  			}
  		})
	})
	
}