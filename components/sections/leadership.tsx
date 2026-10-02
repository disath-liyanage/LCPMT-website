"use client"

import React, { useState } from 'react'
import Image from 'next/image'

interface Member {
  name: string;
  role: string;
  image: string;
}

interface TeamMemberProps {
  member: Member;
  priority: boolean;
}

interface LeadershipSection {
  id: string;
  eyebrow?: string;
  title: string;
  description: string;
  members: Member[];
}

const sections: LeadershipSection[] = [
  {
    id: "club-leadership",
    eyebrow: "Our Leadership | Leoistic Year 2026/27",
    title: "The Titan Leadership",
    description:
      "Our leadership team brings together dedicated Leos committed to guiding the Leo Club of Pannipitiya Metro Titans with purpose, teamwork, and a shared commitment to meaningful service.",
    members: [
      { name: "Leo Lion Shanelka Dissanayaka", role: "Club President", image: "/images/team/shanelka.webp" },
      { name: "Leo Lehansa Wijayaratne", role: "Club Vice President", image: "/images/team/poojani.webp" },
      { name: "Leo Lion Piyumi Iwdugoda", role: "Club Immediate Past President", image: "/images/team/piyumi.webp" },
      { name: "Leo Sinadi Badullage", role: "Club Secretary", image: "/images/team/sinadi.webp" },
      { name: "Leo Thulmanthi Wipularathne", role: "Club Treasurer", image: "/images/team/thulmanthi.webp" }
    ]
  },
  {
    id: "district-leadership",
    title: "District Leadership",
    description:
      "Guiding Leo District 306 D7 with vision and purpose, the District Leadership supports clubs across the District while strengthening collaboration, leadership development, fellowship, and service.",
    members: [
      { name: "Leo Lion Nipuni Wijesekara", role: "District President", image: "/images/team/district/nipuni.webp" },
      { name: "Leo Lion Tehan Nakandala", role: "District Vice President", image: "/images/team/district/tehan.webp" },
      { name: "Leo Lion Hansathi Imethma FLM", role: "Immediate Past District President ", image: "/images/team/district/hansathi.webp" },
      { name: "Leo Misal Silva", role: "District Secretary", image: "/images/team/district/misal.webp" },
      { name: "Leo Lion Muthula Liyanage", role: "District Treasurer", image: "/images/team/district/muthula.webp" }
    ]
  },
  {
    id: "multiple-district-leadership",
    title: "Multiple District Leadership",
    description:
      "Representing and strengthening the Leo movement across Sri Lanka and the Maldives, the Multiple District Leadership brings together Leo Districts under a shared vision of leadership, fellowship, and service while fostering greater collaboration across the movement.",
    members: [
      { name: "Leo Nisal Dulmith FLM", role: "Multiple District President", image: "/images/team/multiple/president.webp" },
      { name: "Leo Lion Sunera Naveed MAF FLM", role: "Multiple District Vice President", image: "/images/team/multiple/vice-president.webp" },
      { name: "Leo Lion Rageesh Yogeswaran", role: "Immediate Past Multiple District President", image: "/images/team/multiple/immediate-past-president.webp" },
      { name: "Leo Lion Sajani Wijesuriya", role: "Multiple District Secretary", image: "/images/team/multiple/secretary.webp" },
      { name: "Leo Lion Lasikumar Parameswaran", role: "Multiple District Treasurer", image: "/images/team/multiple/treasurer.webp" }
    ]
  }
]

export default function LeadershipPage() {
  return (
    <section id="team" className="bg-[#FBFBF8] py-20">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {sections.map((section, sectionIndex) => {
          const Heading = sectionIndex === 0 ? 'h1' : 'h2'

          return (
            <div key={section.id} id={section.id}>
              <div className="flex flex-col items-center text-center mb-12">
                {sectionIndex === 0 && (
                  <div className="w-10 h-1 bg-[#2F6B4A] rounded-full mb-6"></div>
                )}
                {section.eyebrow && (
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2F5D46] mb-4">
                    {section.eyebrow}
                  </p>
                )}
                <Heading className="font-serif text-4xl md:text-5xl font-bold text-[#0F2A1D] mb-6">
                  {section.title}
                </Heading>
                <p className="max-w-3xl text-[#2F5D46]/80 text-base mb-6 leading-relaxed">
                  {section.description}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 md:gap-x-10">
                {section.members.map((member, i) => (
                  <TeamMember
                    key={`${section.id}-${i}`}
                    member={member}
                    priority={sectionIndex === 0 && i < 3}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function TeamMember({ member, priority }: TeamMemberProps) {
  const [imgSrc, setImgSrc] = useState(member.image)
  const [failed, setFailed] = useState(false)

  return (
    <div className="group flex flex-col items-center text-center w-36 sm:w-44 md:w-48">
      <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full overflow-hidden mb-5 relative isolate transform-gpu md:group-hover:-translate-y-2 transition-transform duration-300">
        <Image
          src={imgSrc}
          alt={member.name}
          fill
          sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 176px"
          priority={priority}
          unoptimized={failed}
          className="object-cover object-top md:grayscale md:group-hover:grayscale-0 transition-[filter] duration-500"
          onError={() => {
            if (failed) return
            setFailed(true)
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