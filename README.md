**Try it out at [makereal.tldraw.com](https://makereal.tldraw.com/).**

**To use your own API key, you need to have access to usage tier 1. Check out your current tier, and how to increase it [in the OpenAI settings](http://platform.openai.com/account/limits).**

> This is an experimental fork of Sawyer Hood's [draw a ui](https://github.com/SawyerHood/draw-a-ui).
> Hopefully some of these changes can make it upstream!
>
> - Changes the preview to an embedded shape that appears on the canvas.
> - Only selected shapes are used when generating html.
> - One embedded preview can be given back to GPT, with annotations.
> - Some other tweaks.

# draw-a-ui

This is an app that uses tldraw and the gpt-4-vision api to generate html based on a wireframe you draw.

![A demo of the app](./demo.gif)

This works by just taking the current canvas SVG, converting it to a PNG, and sending that png to gpt-4-vision with instructions to return a single html file with tailwind.

> Disclaimer: This is a demo and is not intended for production use. It doesn't have any auth so you will go broke if you deploy it.

## Getting Started

This is a Next.js app. To get started run the following commands in the root directory of the project. You will need an OpenAI API key with access to the GPT-4 Vision API.

```bash
echo "OPENAI_API_KEY=sk-your-key" > .env.local
yarn
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Using Docker

If you prefer using Docker to run it locally or deploy this to your cloud stack, simply do:
```bash
docker image build -t draw-a-ui:0.1 .
docker container run --rm -p 3000:3000 draw-a-ui:0.1
```
