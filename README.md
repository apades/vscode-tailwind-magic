<p align="center">
<img height="200" src="./assets/kv.png" alt="magic">
</p>
<p align="center"> English | <a href="./README_zh.md">简体中文</a></p>

:WIP> In unocss or tailwind, you may encounter such a problem. I pasted the rgba(100, 200, 300, .3) in the browser, and then used unocss or tailwind, text-[rgba(100,200,300,.3)], and then it is very troublesome to delete the spaces in the middle. This plugin is for laziness, and it will be automatically processed when you save, including some global presets such as flex-center will be automatically processed into justify-center items- Center and so on support configuration

![demo](assets/demo.gif)

## Current processing type
- calc
- rgb[a]
- px|rem|em|%|vw|vh
- #ffffff
- simple preset
- w|h|gap|m|mt|mr|mb|ml|p|pt|pr|pb|pl|b|bt|br|bb|bl|lh|top|right|bottom|left
- w1! -> !w-1
- w--1 -> -w-1

## :coffee:

[buy me a cup of coffee](https://github.com/Simon-He95/sponsor)

## License

[MIT](./license)
