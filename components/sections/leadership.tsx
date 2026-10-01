"use client"

import React, { useState } from 'react'
import Image from 'next/image'

interface TeamMemberProps {
  member: {
    name: string;
    role: string;
    image: string;
  };
  index: number;
}

export default function LeadershipPage() {
  const leadershipTeam = [
    {
      name: "Leo Lion Shanelka Dissanayaka",
      role: "Club President",
      image: "/images/team/shanelka.webp"
    },
    {
      name: "Leo Lehansa Wijayaratne",
      role: "Club Vice President",
      image: "/images/team/poojani.webp"
    },
    {
      name: "Leo Lion Piyumi Iwdugoda",
      role: "Club Immediate Past President",
      image: "/images/team/piyumi.webp"
    },
    {
      name: "Leo Sinadi Badullage",
      role: "Club Secretary",
      image: "/images/team/sinadi.webp"
    },
    {
      name: "Leo Thulmanthi Wipularathne",
      role: "Club Treasurer",
      image: "/images/team/thulmanthi.webp"
    }
  ]

  return (
    <section id="team">
      <div className="bg-[#FEFDF9] py-20">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-10 h-1 bg-[#2F6B4A] rounded-full mb-6"></div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2F5D46] mb-4">
              Our Leadership
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F2A1D] mb-6">
              The Titan Leadership
            </h1>
            <p className="max-w-3xl text-[#2F5D46]/80 text-base mb-6 leading-relaxed">
              Our leadership team brings together dedicated Leos committed to guiding the Leo Club of Pannipitiya Metro Titans with purpose, teamwork, and a shared commitment to meaningful service.
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-[#2F5D46]">
              Leoistic Year 2026/27
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 md:gap-x-10">
            {leadershipTeam.map((member, i) => (
              <TeamMember key={i} member={member} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TeamMember({ member, index }: TeamMemberProps) {
  const [imgSrc, setImgSrc] = useState(member.image)

  return (
    <div className="group flex flex-col items-center text-center w-36 sm:w-44 md:w-48">
      <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full overflow-hidden mb-5 relative group-hover:-translate-y-2 transition-transform duration-300">
        <Image
          src={imgSrc}
          alt={member.name}
          fill
          sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 176px"
          priority={index < 3} 
          className="object-cover grayscale contrast-110 group-hover:grayscale-0 transition-all duration-500"
          onError={() => {
            setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=FBF7ED&color=0F2A1D&size=256`)
          }}
        />
      </div>
      
      <h3 className="font-serif font-bold text-[#0F2A1D] text-base md:text-lg leading-snug mb-1.5 group-hover:text-[#2F5D46] transition-colors">
        {member.name}
      </h3>
      
      <p className="text-[#2F5D46]/70 text-[11px] md:text-xs font-bold uppercase tracking-wider">
        {member.role}
      </p>
    </div>
  )
}