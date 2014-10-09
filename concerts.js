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
    person: function(){
      return People.findOne({_id: Session.get('person')})
    },
    name: function(){
      person = People.findOne({_id: Session.get('person')})
      if(person && person.name){
        return person.name.split(" ")[0]
      }
      return ""
    }
  });

  Template.home.events({
    'click [rel="spotify"]': function () {
     Meteor.call("spotifyLogin", Session.get('person'), function(err,resp){
        window.location.assign(resp)
     })
     },
     'click [rel="rdio"]': function () {
     // Meteor.call("spotifyLogin", Session.get('person'), function(err,resp){
     //    window.location.assign(resp)
     // })
      alert("fuck you, how could you possibly think this would be done already!")
     }
  });
}

if (Meteor.isServer) {

  Meteor.startup(function () {
    process.env.MAIL_URL = 'smtp://postmaster%40concerts.thesquid.net:9cda28bea950d6c8cd3e911aa61f7ab2@smtp.mailgun.org:587';
  });
}
