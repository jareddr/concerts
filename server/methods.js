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
	      redirectUri = 'https://localhost:3000/callback',
	      clientId = '42e6f4a80ac44c98bff1649d3f1a4dff',
	      state = person

	      // Create the authorization URL
	      var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

	      // https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
	      return authorizeURL
	  },
	  newPerson: function () {
	      id = People.insert({})
	      return id;
       }
	})
}