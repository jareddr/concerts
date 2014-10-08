if (Meteor.isServer){

	Router.map(function () {
	
	  this.route('callback', {
	    where: 'server',
	    path: '/callback',

	    action: function () {
		    var code = this.request.query.code,
		    	state = this.request.query.state,
		    	person = this.request.query.state,
		    	tracks = []


	    	//console.log(code + " -- " + state)
	    	if(code && state){

		    	this.response.writeHead(301, {'Location': '/thanks'})
		    	this.response.end()

		    	//save code
		    	People.update({_id: state}, {$set: {spotifyCode: code}})
		    	console.log('loading npm module')
		    	// track detail information for album tracks
		    	var SpotifyWebApi = Meteor.npmRequire('spotify-web-api-node');

				// credentials are optional
				var spotifyApi = new SpotifyWebApi({
					clientId : '42e6f4a80ac44c98bff1649d3f1a4dff',
					clientSecret : 'bfde5612aab446928e3bbd0b43767fe4',
					redirectUri : Meteor.absoluteUrl("callback")
				});
				console.log('reqeusting grant')
				var grant = Async.runSync(function(done) {
				  spotifyApi.authorizationCodeGrant(code).then(function(data) { done(null,data) }, function(err) { done(err,null) } )
				});

				//if we got an error, bail out
				if(grant.error){ 
					console.log(grant.error)
					return false 
				}
				
				console.log('accessing spotify user data')
				People.update({_id: person}, {$set: {spotifyAccessToken: grant.result.access_token, spotifyRefreshToken: grant.result.refresh_token}})	
				spotifyApi.setAccessToken(grant.result.access_token);
				spotifyApi.setRefreshToken(grant.result.refresh_token);

				var spotifyUser = Async.runSync(function(done){
					spotifyApi.getMe().then(function(data) { done(null,data) }, function(err) { done(err,null)});
				})

				//if we got an error, bail out
				if(spotifyUser.error){ 
					console.log(spotifyUser.error)
					return false 
				}

				People.update({_id: person}, {$set: {email: spotifyUser.result.email, name: spotifyUser.result.display_name, spotify_user_id: spotifyUser.result.id}})

				var lists = [],
					limit = 50,
					total = 99999

				console.log('loading playlists')

				for(var i = 0; i < total; i+=limit){
					var playlists = Async.runSync(function(done){
						spotifyApi.getUserPlaylists(spotifyUser.result.id, {offset: i, limit: 50} ).then(function(data) { done(null,data) }, function(err) { done(err,null)});
					})

					//if we got an error, bail out
					if(playlists.error){ 
						console.log(playlists.error)
						return false 
					}

					total = playlists.result.total

					playlists.result.items.map(function(p){
						lists.push(p)
					})
					//console.log(playlists)

				}

				var trackList = [],
					limit = 50,
					total = 99999

				console.log('loading tracks')

				lists.map(function(p){

					var tracks = Async.runSync(function(done){
						spotifyApi.getPlaylist(spotifyUser.result.id, p.id ).then(function(data) { done(null,data) }, function(err) { done(err,null)});
					})

					//if we got an error, bail out
					if(tracks.error){ 
						console.log(tracks.error)
						return false 
					}
					tracks.result.tracks.items.map(function(t){
						trackList.push(t)
					})
				})

				var artistList = {}
				trackList.map(function(t){
					t.track.artists.map(function(a){
						artistList[a.name] = artistList[a.name] ? artistList[a.name] + 1 : 1
					})
				})

				//console.log(artistList)

				Artists.remove({person:person})
				for (var name in artistList) {
				  Artists.insert({person:person, name:name, count:artistList[name]})
				}

	      	}
	      	else{
	      		this.response.writeHead(400, {'Content-Type': 'text/html'})
	      		this.response.end("error")
	      	}
	    }
	  });
	});
}