if (Meteor.isServer){
	Meteor.methods({
	    spotifyLogin: function(person){
	       var SpotifyWebApi = Meteor.npmRequire('spotify-web-api-node');

	      // credentials are optional
	      var spotifyApi = new SpotifyWebApi({
	        clientId : '42e6f4a80ac44c98bff1649d3f1a4dff',
	        clientSecret : 'bfde5612aab446928e3bbd0b43767fe4',
	        redirectUri : Meteor.absoluteUrl("callback")
	      });

	      var scopes = ['user-read-private', 'user-read-email', 'playlist-read-private'],
	      state = person

	      // Create the authorization URL
	      var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

	      // https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
	      return authorizeURL
	  },
	  newPerson: function () {
	      id = People.insert({})
	      return id;
       },
       geoIpLookup: function(person,ip){
       		console.log("lookup:",person,ip)
       		var link = ip ? "http://freegeoip.net/json/"+ip : "http://freegeoip.net/json/"
       		var request = HTTP.get(link),
       			location = null
       		if(request.data.country_code == "US"){
       			location = request.data.city + ", " + request.data.region_name
       		}
       		else if(request.data.country_code){
       			location = request.data.city + ", " + request.data.country_name	
       		}

       		if(person && location){
       			People.update({_id: person}, {$set: {location: location, ip: ip}})
       		}
       		//console.log(location,request.data)
       		return request.data
       },
       sendEmail: function(eventList,person){
       		if(!Array.isArray(eventList)){
       			return
       		}

       		person = People.findOne({_id:person})

       		from = "concerts@thesquid.net"
       		subject = "Concerts you might like in the next 7 days"
       		to = person ? person.email : "unknown"

       		body = "Here are some upcoming shows you might want to see.\n\n"

       		eventList.map(function(n){
       			body += n.title + "\n"
       			body += "At: " + n.venue_name + "\n"
       			body += "Starting at: " + n.start_time + "\n"
       			body += "Featuring: " + (Array.isArray(n.performers.performer) ? _.pluck(n.performers.performer, "name").join(", ") : n.performers.performer.name)
       			body += "\n\n"
       		})

       		console.log(from,to,subject)
       		console.log(body)
       		console.log(process.env.MAIL_URL)
       		 Email.send({
		          to: to,
		          from: from,
		          subject: subject,
		          text: body
		        });

       },
       findEvents: function(person){
       		var user = People.findOne({_id:person}),
       			totalEvents = 1,
       			pageSize = 100,
       			eventList = [],
       			pageNumber = 1,
       			notifyList = []
       			console.log(user.location)
       		for(var i=0; i<totalEvents; i+=pageSize){
	       		eventData = HTTP.get("http://api.eventful.com/json/events/search?app_key=PRnBQ2dQxHvKhkcn&q=music&where="+user.location+"&t=Next 7 days&page_number="+pageNumber+"&page_size="+pageSize+"&sort_order=popularity&json_request_id=1")
	       		events = JSON.parse(eventData.content.replace(/var obj = /, "").replace(/; EVDB\.API\._complete\(1, obj\);\n/, ""))
	       		if(typeof events == "object" && typeof events.events == "object" && typeof events.events.event == "object"){
	       			eventList = _.union(eventList, events.events.event)
	       			console.log("Added more events", eventList.length, "total:", totalEvents)
	       			totalEvents = events.total_items
	       		}
	       		
	       		pageNumber++
	       		
	       	}

       		eventList.map(function(e){
       			if(e.performers){
	       			if(Array.isArray(e.performers.performer)){
		       			e.performers.performer.map(function(p){
		       				//console.log(p.name)
		       				if(Artists.findOne({person:person, name: p.name.trim()})){
		       					notifyList.push(e)
		       				}
		       			})
		       		}
		       		else{
		       			//console.log(e.performers.performer.name)
		       			if(Artists.findOne({person:person, name: e.performers.performer.name.trim()})){
		       					notifyList.push(e)
		       				}
		       		}
	       		}
       		})
       		Meteor.call("sendEmail", notifyList, person)
       }
	})
}