import React from 'react';

const AboutACM = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="bodoni-moda text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            About ACM VNR VJIET
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-orange-600 mx-auto mb-8"></div>
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <div className="prose prose-lg prose-invert mx-auto">
            <p className="text-white/80  cal-sans-regular text-lg leading-relaxed mb-6">
              ACM is an international student chapter that brings together technology geeks, computer educators, 
              working professionals, among others and gives them a platform to share all things related to the 
              world of rapidly evolving technology. ACM has always been at the forefront of raising awareness 
              about new technologies, educating people and empowering them to do something new. Apart from being 
              a technological learning and skill sharing platform, ACM is also renowned for developing in its 
              members a sense of teamwork and dedication. It empowers individuals to scale new heights in their 
              professional careers.
            </p>
            
            <p className="text-white/80 cal-sans-regular text-lg leading-relaxed">
              With more than 100,000 members worldwide, the fraternity only continues to grow stronger in every 
              passing year. A chapter with such illustrious history, finds its place with a great prominence in 
              VNRVJIET. The team running the chapter constantly strives to bring about awareness and widen the 
              reach of technology and its wonders to more and more people.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutACM;