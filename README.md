<p align="center">
    <img 
        height="300px"
        style="margin: 1rem auto;"
        src="https://raw.githubusercontent.com/sebringrose/peko/main/examples/preact/src/assets/logo_light_alpha.png" alt="peko-logo" 
    />
</p>

<p align="center">
    <span>
        &nbsp;
        <a href="#Types">
            Types
        </a>
        &nbsp;
    </span>
    <span>
        &nbsp;
        <a href="#routing">
            Routing
        </a>
        &nbsp;
    </span>
    <span>
        &nbsp;
        <a href="#request-handling">
            Request handling
        </a>
        &nbsp;
    </span>
    <span>
        &nbsp;
        <a href="#response-caching">
            Response caching
        </a>
        &nbsp;
    </span>
</p>

<p align="center">
    <span>
        &nbsp;
            <a href="https://doc.deno.land/https://deno.land/x/peko/mod.ts">
                API DOCS
            </a>
        &nbsp;
    </span>
    <span>
        &nbsp;
            <a href="https://github.com/sebringrose/pekommunity">
                COMMUNITY TOOLS
            </a>
        &nbsp;
    </span>
</p>

<h1>Stateless HTTP(S) apps that are:</h1>

- <strong>Featherweight</strong> - Browser-native JavaScript + Deno std library

- <strong>Functional</strong> - [Express](https://github.com/expressjs/express)-like API + full-stack tooling

- <strong>Production-ready</strong> - High test coverage + stable APIs + server profiling

- <strong>Community-driven</strong> - Popular tool integrations + contributions encouraged 

<h1>Overview</h1>

Routes and middleware are added to a `Router` instance with `.use`, `.addRoute` or `.get/post/put/delete`. 

The router is then used with your web server of choice, e.g. `Deno.serve`!

```js
import * as Peko from "https://deno.land/x/peko/mod.ts";

const router = new Peko.Router();

router.use(Peko.logger(console.log));

router.get("/shorthand-route", () => new Response("Hello world!"));

router.post("/shorthand-route-ext", async (ctx, next) => { await next(); console.log(ctx.request.headers); }, (req) => new Response(req.body));

router.addRoute({
    path: "/object-route",
    middleware: async (ctx, next) => { await next(); console.log(ctx.request.headers); }, // can also be array of middleware
    handler: () => new Response("Hello world!")
})

router.addRoutes([ /* array of route objects */ ])

Deno.serve((req) => router.requestHandler(req))
```

<h2 id="types">Types</h2>

### [**Router**](https://deno.land/x/peko/mod.ts?s=Router)
The main class of Peko, provides `requestHandler` method to generate `Response` from `Request` via configured routes and middleware. 

### [**Route**](https://deno.land/x/peko/mod.ts?s=Route)
Objects with `path`, `method`, `middleware`, and `handler` properties. Requests are matched to a regex generated from the given path. Dynamic parameters are supported in the `/users/:userid` syntax.

### [**RequestContext**](https://deno.land/x/peko/mod.ts?s=RequestContext)
An object containing `url`, `params` and `state` properties that is provided to all middleware and handler functions associated to a router or matched route. 

### [**Middleware**](https://deno.land/x/peko/mod.ts?s=Middleware)
Functions that receives a RequestContext and a next fcn. Should update `ctx.state`, perform side-effects or return a response.

### [**Handler**](https://deno.land/x/peko/mod.ts?s=Handler)
The final request handling function on a `Route`. Must generate and return a response using the provided request context.

<h2 id="request-handling">Request handling</h2>

Each route must have a <code>handler</code> function that generates a [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response). 

Upon receiving a request a `Router` will construct a [RequestContext](https://deno.land/x/peko/server.ts?s=RequestContext) and cascade it through global middleware, route middleware and the route handler. 

Middleware are invoked in the order they are added. If a response is returned no subsequent middleware/handler will execute.

Peko comes with a library of utilities, middleware and handlers for common route use-cases, such as:
- server-side rendering apps to HTML
- streaming server-sent events
- hashing and JWT authentication
- logging requests
- caching responses

See `handlers`, `mmiddleware` or `utils` for source, or dive into `examples` for demo implementations. 

### `next: () => Promise<Response>`

The second argument to any middleware is the `next` fcn. This returns a promise that resolves to the first response returned by any subsequent middleware/handler. This is useful for error-handling as well as post-response operations such as editing headers or logging. See the below snippet or `middleware/logger.ts` for examples.

If no matching route is found for a request an empty 404 response is sent. If an error occurs in handling a request an empty 500 response is sent. Both of these behaviours can be overwritten with the following middleware:

```js
router.use(async (_, next) => {
    const response = await next();
    if (!response) return new Response("Would you look at that? Nothing's here!", { status: 404 });
});
```

```js
router.use(async (_, next) => {
    try {
        await next();
    } catch(e) {
        console.log(e);
        return new Response("Oh no! An error occured :(", { status: 500 });
    }
});
```

<h2 id="response-caching">Response caching</h2>

In stateless computing, memory should only be used for source code and disposable cache data. Response caching ensures that we only store data that can be regenerated or refetched. Peko provides a `ResponseCache` utility for this with configurable item lifetime. The `cacher` middleware wraps it and provides drop in handler memoization and response caching for your routes.

```js
const cache = new Peko.ResponseCache({ lifetime: 5000 });

router.addRoute("/do-stuff", Peko.cacher(cache), () => new Response(Date.now()));
```

And that's it! Check out the API docs for deeper info. Otherwise happy coding 🤓

<h2>App showcase</h2>

PR to add your project 🙌

### [iiisun.art](https://iiisun.art) - artistic storefront 
- **Stack:** React, ImageMagick_deno
- **Features:** CI resized-image precaching, Gelato & Stripe integrations, Parallax CSS
- [source](https://github.com/sebringrose/third-sun/blob/main/server.ts)

### [shineponics.org](https://shineponics.org) - smart-farming PaaS 
- **Stack:** React, Google Cloud Platform
- **Features:** Google Sheet analytics, GCP email list, Markdown rendering
- [source](https://github.com/shine-systems/shineponics/blob/main/server.ts)

### [peko-auth.deno.dev](https://peko-auth.deno.dev) - basic authentication demo 
- **Stack:** HTML5
- **Features:** JWT-based auth
- [source](https://github.com/sebringrose/peko/blob/main/examples/auth/app.ts)

**Note:** [lit-html](https://marketplace.visualstudio.com/items?itemName=bierner.lit-html) and [es6-string-css](https://marketplace.visualstudio.com/items?itemName=bashmish.es6-string-css) VS Code extensions recommended.

<h2>Deployment</h2>

- [Deno Deploy](https://dash.deno.com/projects) (fork and deploy the examples if you fancy 💖)
- Docker (coming soon...)

<h2>What does stateless mean?</h2>

Peko apps are designed to boot from scratch at request time and disappear once the request is served. Therefore, storing data in memory between requests (stateful logic) is not reliable. Instead we should use stateless logic and store data within the client or external services.

This paradigm is often referred to as "serverless" or "edge computing" on cloud platforms, which offer code execution on shared server hardware. This is [much more resource efficient](https://developer.ibm.com/blogs/the-future-is-serverless/) than traditional server provisioning.

Because our stateless apps cold-start it is important to keep their codebases small. The preact demo app only imports Peko and Preact as external dependencies and is very fast as a result - [https://peko.deno.dev](https://peko.deno.dev)!

<strong>Note:</strong> In reality a single app instance will serve multiple requests, we just can't guarantee it. This is why caching is still an effective optimization strategy but in-memory user sessions are not an effective authentication strategy.

<h2 id="cool">Motivations</h2>

The modern JavaScript edge rocks because the client-server gap practically disappears. We can share modules across the client and cloud. If we want TS source we can [emit](https://github.com/denoland/deno_emit) JS. This eliminates much of the bloat in traditional JS server-side systems, increasing project simplicity while making our software faster and more efficient.

This is made possible by engines such as Deno that are built to the [ECMAScript](https://tc39.es/) specification</a> (support for URL module imports is the secret sauce). UI libraries like [Preact](https://github.com/preactjs/preact) combined with [htm](https://github.com/developit/htm) offer lightning fast client-side hydration with a browser-friendly markup syntax. Deno also has native TypeScript support, a rich runtime API and loads of community tools for your back-end needs.

If you are interested in contributing please submit a PR or get in contact ^^
