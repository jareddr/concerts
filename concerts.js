var authPopup

if (Meteor.isClient) {

  Meteor.startup(function() {
   if(localStorage.getItem("person")) {
    Session.set("person", localStorage.getItem("person"))
   }
   else{
    Meteor.call("newPerson", function(err,resp){
      localStorage.setItem("person", resp)
      Session.set("person", localStorage.getItem("person"))
    })
   }
  })

  

  Template.home.helpers({
    artists: function(){
      return Artists.find({person: Session.get('person')}, {sort: {count:-1}}).fetch()
    }
  });

  Template.thanks.helpers({
    artists: function(){
      return Artists.find({person: Session.get('person')}, {sort: {count:-1}}).fetch()
    }
  });

  Template.home.events({
    'click button': function () {
     Meteor.call("spotifyLogin", Session.get('person'), function(err,resp){
        window.location.assign(resp)
     })
     }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
