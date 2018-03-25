# Heckle

A minimal [Jekyll][1] clone in node.js.

[1]: https://github.com/mojombo/jekyll

## Why?

I like the approach to managing a site taken by Jekyll. A lot.

I don't like Ruby, and I don't like strict logic-less templates.
Jekyll is Ruby with Liquid as the templating engine.

Heckle is JavaScript with Mold (programmable template extravaganza) as
the templating engine.

## Setup

Don't use Heckle at this point if you want something stable and
finished. It's a work in progress, and may be radically changed or
pitilessly abandoned at any time.

If that didn't scare you off, you should be able to get dependencies
with `npm install`.

When the dependencies have been installed, you should be able to
change to the directory that contains your blog files, and run...

    nodejs /path/to/heckle/heckle.js

It parses a `_config.yml` and treats `_posts`, `_layouts`, and
`_includes` dirs much like [Jekyll][1]. Your templates should be in
[Mold][3] syntax and read `$arg` rather than `post` or `page` to get
context information.

[3]: http://marijnhaverbeke.nl/mold/

At some point, more detailed docs, as well as command-line arguments,
might materialize. For now, read the code, it's (at the time of
writing) less than 200 lines.
