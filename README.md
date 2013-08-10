inspect-https
=============

node.js-powered transparent https (reverse) proxy that you can use to inspect https messages for dev purposes


Hopefully you can adapt this for your purposes.

But let's say you're developing an iOS native app that connects to a secure host (over TLS), and you'd rather view the traffic going back and forth from an external utility instead of going into the iOS app itself.

Assuming you have access to the iOS's source and can make it accept non-signed certs (see below on how to do that), you're in luck. I'm also assuming that this traffic is signed (via OAuth or some other protocol; so the hostname you use in your requests must match the one on the server). That's where Charles.app and other reverse proxies would tend to break down. Not here, players, not here.

Example usage
=============

Example destination url: https://services.example.com

Step 1:

Configure your client like normal to use https://services.example.com in its requests.

If you don't have access to an SSL cert, you'll need to allow for self-signed certs. E.g., on iOS if you're using NSURLConnection, set your NSURLConnectionDelegate to use:

    - (BOOL)connection:(NSURLConnection *)connection canAuthenticateAgainstProtectionSpace:(NSURLProtectionSpace *)protectionSpace {
        return [protectionSpace.authenticationMethod isEqualToString:NSURLAuthenticationMethodServerTrust];
    }
    - (void)connection:(NSURLConnection *)connection didReceiveAuthenticationChallenge:(NSURLAuthenticationChallenge *)challenge {
        if ([challenge.protectionSpace.authenticationMethod isEqualToString:NSURLAuthenticationMethodServerTrust])
                [challenge.sender useCredential:[NSURLCredential credentialForTrust:challenge.protectionSpace.serverTrust] forAuthenticationChallenge:challenge];
        
        [challenge.sender continueWithoutCredentialForAuthenticationChallenge:challenge];
    }

Step 2 (optional, also bundled):

Again, if you're going to use your own cert, generate the self-signed certs:

    openssl genrsa -out privatekey.pem 1024
    openssl req -new -key privatekey.pem -out certrequest.csr
    openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem

Step 3:

ping services.example.com. make note of the ip address for later.

Step 4:

    sudo /etc/hosts:

    127.0.0.1 services.example.com

Step 5:

    sudo node inspect-https.js <ip address of services.example.com>
