

# Starchart

Starchart makes it easy for the Seneca developer community to create and manager their own custom subdomains and SSL certificates, without cost or having to provide personal information. 

## Table of Contents
<!-- TOC -->
* [Starchart](#starchart)
  * [Table of Contents](#table-of-contents)
  * [Introduction](#introduction)
  * [1.0 Features](#10-features)
  * [Technologies](#technologies)
  * [Development](#development)
    * [How to run](#how-to-run)
      * [Webserver](#webserver)
        * [API](#api)
        * [Metrics](#metrics)
<!-- TOC -->

## Introduction

The internet is evolving, and what used to be hard has become simple.  For example, hosting your own website used to require knowledge of server administration, operating systems, networking, etc.  Today, many developers host their personal and project websites without ever touching a remote server, opting for (free) cloud services like GitHub Pages, Vercel, Netlify, or AWS.

The internet's security model is also evolving.  For example, browser vendors have embraced HTTPS everywhere.  This is good for security, as it enables certificate-based encryption between clients and servers.  However, as with many security best practices, the change has also added complexity to development and deployment.

With the move to HTTPS everywhere, developers wishing to communicate between hosts need to be able to register custom domains and work with SSL certificates.  Seneca developers need to build and run many internet services securely, and in a way that can be shared with other teammates, instructors, etc.  For example, running a project web site on GitHub or deploying an API with a load balancer on AWS.

Starchart makes it easy to quickly and freely create subdomains and SSL certificates to access these services using a memorable name, and to do so in a secure way.

Working with custom domains and certificates is particularly hard for student developers, who need to work across network hosts to learn and experiment.  However, many don't have credit cards (or the money to buy domains), and don't necessarily understand the risks of leaking their personal information via domain registration (i.e., hiding your personal information for a .com domain costs even more money).

Starchart aims to support our educational developer community while they build and deploy services that require custom domains and certificates.  It provides time-limited, personalized subdomains and SSL certificates that can be used in various hosting, cloud, or API contexts.

Starchart is not meant to be, or replace commercial registrars; nor is it meant for use outside of our educational/developer context.

## 1.0 Features

- An authoritative DNS server manages a single domain (e.g., `example.com`)
- A Web app and API server allow users to create subdomains for their own use.  This includes being able to specify one or more [A Record](https://www.cloudflare.com/learning/dns/dns-records/dns-a-record/) (e.g., provide a domain name for an IP address) and/or [CNAME](https://www.cloudflare.com/learning/dns/dns-records/dns-cname-record/) (e.g., to provide an alias for an existing domain).
- Seneca faculty and students can use their existing Seneca SSO accounts to authorize and then self-manage unique subdomains, based on their SSO username
- Each authorized user can create subdomains of the form: `{project|host}.{username}.example.com`.  For example, the Seneca user `klee` could create: `project123.klee.example.com` or `laptop.klee.example.com`.  The `*.klee.example.com` portion of the subdomain is fixed for each user (i.e., the user `klee` can't create subdoimains other than `*.klee.example.com`).
- An SSL certificate is also generated for `*.{username}.example.com` using a [DNS Challenge](https://letsencrypt.org/docs/challenge-types/#dns-01-challenge), allowing any subdomains created for this username to be accessed securely.
- Each domain is made available for a time-limited period (for example: "1 term" or "1 year").
- An administration layer to handle abuse or limit users when necessary (for example, being able to remove or blacklist an entire user or subdomain)

## Technologies

There are a number of components of the system:

1. A [PowerDNS](https://www.powerdns.com/) Authoritative DNS server with REST API capable of dynamic configuration.  This DNS server is replicated to a public DNS host (e.g., CIRA) and is not exposed publicly
2. A database [backend](https://doc.powerdns.com/authoritative/backends/index.html) for PowerDNS to store its records dynamically 
3. A node.js back-end server, with the ability to connect to the DNS server's API and to authorize users via SSO
4. A web front-end that allows authorized users to manage their own subdomains and certificates

## Development

### How to run
To run the project locally, you need to have docker and docker-compose installed. Then, run the following command(s) in the root directory of the project:

```bash
docker-compose up
```

#### Webserver
Once the containers are up and running, you can access the primary DNS's webserver at `http://localhost:8081/` (port 8081 maps to the internal port 80 in the docker-compose file).

##### API
The API for the DNS server is available at the `/api` [endpoint](http://127.0.0.1:8081/api), and the `X-API-Key` header must be set to the key defined in the `/config/pdns-private.conf` file.
```bash
curl -v -H 'X-API-Key: secret-api-key' http://127.0.0.1:8081/api/v1/servers/localhost
```

##### Metrics
A `/metrics` [endpoint](http://127.0.0.1:8081/metrics) is also exposed by the webserver which can be used to monitor the health of the DNS server.

<hr>

Further technical background, planning, and initial designs are available in the [wiki](https://github.com/Seneca-CDOT/starchart/wiki)
