import { describe, expect, it } from 'vitest'
import { transform } from '../src/transform'

describe('should', () => {
  it('exported', () => {
    expect(transform('class="w10 font600 bg-rgba(0,0,0)"')).toMatchInlineSnapshot('"class=\\"w-10 font-semibold bg-[rgba(0,0,0)]\\""')
  })
  it('exported', () => {
    expect(transform('class="max-w10"')).toMatchInlineSnapshot('"class=\\"max-w-10\\""')
  })
  it('exported', () => {
    expect(transform('class="h-10 w-calc(100%-10px) max-w-1"')).toMatchInlineSnapshot('"class=\\"h-10 w-[calc(100%-10px)] max-w-1\\""')
  })
  it('exported', () => {
    expect(transform('class="pointer pointer-none"')).toMatchInlineSnapshot('"class=\\"cursor-pointer pointer-events-none\\""')
  })
  it('exported', () => {
    expect(transform('class="border-rd-1"')).toMatchInlineSnapshot('"class=\\"rounded-1\\""')
  })
  it('exported', () => {
    expect(transform('class="left--50%"')).toMatchInlineSnapshot('"class=\\"-left-[50%]\\""')
  })
  it('exported', () => {
    expect(transform('class="translate-x--50%"')).toMatchInlineSnapshot('"class=\\"-translate-x-[50%]\\""')
  })
  it('exported', () => {
    expect(transform('class="border-#fff"')).toMatchInlineSnapshot('"class=\\"border-[#fff]\\""')
  })
  it('exported', () => {
    expect(transform('class="duration0"')).toMatchInlineSnapshot('"class=\\"duration-0\\""')
  })
  it('exported', () => {
    expect(transform('class="border1 bg-[rgba(0,0,0,0.8)]"')).toMatchInlineSnapshot('"class=\\"border bg-[rgba(0,0,0,0.8)]\\""')
  })
  it('exported', () => {
    expect(transform('class="z-[99] bg-[rgba(0,0,0,0.8)]   fixed top-0 bottom-0 left-0 right-0 flex items-center justify-center"')).toMatchInlineSnapshot('"class=\\"z-[99] bg-[rgba(0,0,0,0.8)]   fixed top-0 bottom-0 left-0 right-0 flex items-center justify-center\\""')
  })
  it('exported', () => {
    expect(transform('class="hover:w10"')).toMatchInlineSnapshot('"class=\\"hover:w-10\\""')
  })
  it('exported', () => {
    expect(transform('class="dark:w10"')).toMatchInlineSnapshot('"class=\\"dark:w-10\\""')
  })
  it('exported', () => {
    expect(transform('class="dark:md:hover:w10"')).toMatchInlineSnapshot('"class=\\"dark:md:hover:w-10\\""')
  })
  it('exported', () => {
    expect(transform('class="!w10"')).toMatchInlineSnapshot('"class=\\"!w-10\\""')
  })
  it('exported', () => {
    expect(transform('class="w10px!"')).toMatchInlineSnapshot('"class=\\"!w-[10px]\\""')
  })
  it('exported', () => {
    expect(transform('class="ml--10px! !w10"')).toMatchInlineSnapshot('"class=\\"!-ml-[10px] !w-10\\""')
  })
  it('exported', () => {
    expect(transform('class="position-center"')).toMatchInlineSnapshot('"class=\\"left-0 right-0 top-0 bottom-0\\""')
  })
  it('exported', () => {
    expect(transform('class="hidden!"')).toMatchInlineSnapshot('"class=\\"!overflow-hidden\\""')
  })
  it('exported', () => {
    expect(transform('class="text-18px text-1rem"')).toMatchInlineSnapshot('"class=\\"text-lg text-[1rem]\\""')
  })
})
