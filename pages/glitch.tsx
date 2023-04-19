import WriteOn from '@/components/WriteOn';
import { isWebGLSupported } from '@/utils';
import { Transition } from '@headlessui/react';
import dynamic from 'next/dynamic';
import { FC, useEffect, useState } from 'react';

const GlitchBG = dynamic(() => import('../components/GlitchBG'), { ssr: false });

export default function Home() {
  const [title, setTitle] = useState('');
  const [textIndex, setTextIndex] = useState(-7);
  const text = "Curate"

  useEffect(() => {
    const timer = setTimeout(() => {
      if (textIndex < text.length) {
        if (textIndex >= 0) setTitle(title + text[textIndex]); // Add the next character to the title
        setTextIndex(textIndex + 1); // Increment the index
      }
    }, 420); //delay


    return () => {
      clearTimeout(timer);
    }
  }, [textIndex]);

  return (
    <div className='bg-stone-950 h-screen flex flex-wrap w-full'>
      <GlitchBG className='h-[30%] lg:h-full relative w-full lg:w-[33%]' />
 
      <div
        className="flex flex-col items-center justify-evenly w-full lg:w-[66%] h-[70%] lg:h-full"
      >
        <div className='z-[1] relative '>

          <Wait time="delay-[0.6s]">
            <h1
              className='font-title text-left text-[4rem] md:text-[6rem] text-stone-700 relative lg:right-[10vw] top-[4rem]'
            // style={{ textShadow: '4px 4px 0px rgba(48, 45, 43, 0.5)'}}
            >Create</h1>
          </Wait>
          <h1
            className='font-title text-left h-[10rem] text-[4rem] md:text-[6rem] text-stone-200  leading-none z-10 flex items-center tracking-[-0.0005em]'
            // style={{ textShadow: '4px 4px 0px rgba(87 83 78)', filter: 'drop-shadow(2px 2px 6px black' }}
          >{title}</h1>
          <Wait time="delay-[1.6s]">
            <h1
              className='font-title text-left text-[4rem] md:text-[6rem] text-stone-700 relative lg:left-[10vw] bottom-[4rem] z-[-1]'
            // style={{ textShadow: '4px 4px 0px rgba(48, 45, 43, 0.5)' }}
            >Collect</h1>
          </Wait>
        </div>

        <div
          className='
            hidden lg:grid
            w-full grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] 
            gap-3 items-center relative bottom-[5rem]
            text-2xl text-center text-stone-200 bg-stone-950
          '
          style={{ textShadow: '2px 2px 4px black' }}
        >
          <Wait time="delay-[0.6s]">Create</Wait>

          <Wait time="delay-[2.6s]">|</Wait>

          <Wait time="delay-[2.6s]">
            <Transition
              appear={true}
              show={true}
              enter={`delay-[2.6s] transition duration-1000 ease-out`}
              enterFrom="transform translate-y-5 opacity-0"
              enterTo="transform translate-y-0 opacity-100"
            >
              Everything In Between
            </Transition>
          </Wait>

          <Wait time="delay-[2.6s]">|</Wait>

          <Wait time="delay-[1.6s]">Collect</Wait>
        </div>
      </div>
    </div>
  )
}

const Wait: FC<{ children: JSX.Element | string, time: string }> = ({ children, time }) => (
  <Transition
    appear={true}
    show={true}
    enter={`${time} transition`}
    enterFrom="transform opacity-0"
    enterTo="transform opacity-100"
  >
    {children}
  </Transition>
)