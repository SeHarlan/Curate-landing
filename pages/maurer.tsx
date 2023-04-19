import { Transition } from '@headlessui/react';
import dynamic from 'next/dynamic';
import { FC, useEffect, useState } from 'react';

const MaurerBG = dynamic(() => import('../components/MaurerBG'), { ssr: false });

export default function Home() {
  const [title, setTitle] = useState('');
  const [textIndex, setTextIndex] = useState(-7);
  const text = "Curate"

  useEffect(() => {
    const timer = setTimeout(() => {
      if (textIndex < text.length) {
        if(textIndex >= 0) setTitle(title + text[textIndex]); // Add the next character to the title
        setTextIndex(textIndex + 1); // Increment the index
      }
    }, 420); //delay


    return () => {
      clearTimeout(timer);
    }
  }, [textIndex]);

  return (
    <div className='bg-stone-950 overflow-hidden'>
      <MaurerBG className='absolute top-0 left-0 w-full h-full' />
      <div
        className="w-full flex items-center justify-center mt-[10vh]"
      >
        <div className='lg:py-[3rem] px-[6rem z-[1] relative left-[1rem]'>

          <Wait time="delay-[0.6s]">
            <h1
              className='font-title text-left text-[4rem] md:text-[8rem] lg:text-[10rem] text-stone-900/80 relative lg:right-[10vw] top-[4rem]'
              // style={{ textShadow: '4px 4px 0px rgba(48, 45, 43, 0.5)'}}
            >Create</h1>
          </Wait>
          <h1
            className='font-title text-left h-[10rem] text-[4rem] md:text-[7rem] lg:text-[10rem] text-amber-50  leading-none z-10 flex items-center tracking-[-0.0005em]'
            style={{ textShadow: '4px 4px 0px rgba(87 83 78)', filter: 'drop-shadow(2px 2px 6px black' }}
          >{title}</h1>
          <Wait time="delay-[1.6s]">
            <h1
              className='font-title text-left text-[4rem] md:text-[8rem] lg:text-[10rem] text-stone-900/80 relative lg:left-[10vw] bottom-[4rem] z-[-1]'
              // style={{ textShadow: '4px 4px 0px rgba(48, 45, 43, 0.5)' }}
            >Collect</h1>
          </Wait>
        </div>
        
      </div>
      <div
        className='
          grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] 
          px-20 gap-3 items-center relative bottom-[5rem]
          text-2xl text-center text-amber-50
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