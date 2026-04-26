import React from 'react';

function Contact() {
  return (
    <main className="max-w-container-max mx-auto px-8 pt-[140px] pb-section-gap flex-grow">
      <div className="text-center mb-16">
        <h1 className="font-headline-display text-headline-display text-primary mb-4">Get in Touch</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          We're here to answer your questions and guide you on your skincare journey.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-16 max-w-5xl mx-auto">

        {/* Contact Form */}
        <div className="flex-1 bg-surface border border-outline-variant rounded-2xl p-8 md:p-12 shadow-sm">
          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex flex-col gap-2">
                <label htmlFor="firstName" className="font-label-lg text-primary">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  className="bg-background border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-rose-500 font-body-md text-on-surface transition-colors"
                  placeholder="Jane"
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label htmlFor="lastName" className="font-label-lg text-primary">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  className="bg-background border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-rose-500 font-body-md text-on-surface transition-colors"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-label-lg text-primary">Email Address</label>
              <input
                type="email"
                id="email"
                className="bg-background border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-rose-500 font-body-md text-on-surface transition-colors"
                placeholder="jane@example.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="font-label-lg text-primary">Message</label>
              <textarea
                id="message"
                rows="5"
                className="bg-background border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-rose-500 font-body-md text-on-surface transition-colors resize-none"
                placeholder="How can we help you today?"
              ></textarea>
            </div>

            <button
              type="submit"
              className="mt-4 bg-primary text-on-primary py-4 rounded-lg font-label-caps tracking-widest uppercase hover:bg-primary/90 transition-colors duration-300"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="w-full lg:w-80 flex flex-col gap-10 pt-4">
          <div>
            <h3 className="font-headline-sm text-lg text-primary mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-rose-600">location_on</span>
              Visit Us
            </h3>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              Dhaka<br />
              Bangladesh
            </p>
          </div>

          <div>
            <h3 className="font-headline-sm text-lg text-primary mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-rose-600">mail</span>
              Email Us
            </h3>
            <p className="font-body-md text-on-surface-variant">
              hello@beautify.com<br />
              support@beautify.com
            </p>
          </div>

          <div>
            <h3 className="font-headline-sm text-lg text-primary mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-rose-600">schedule</span>
              Hours
            </h3>
            <p className="font-body-md text-on-surface-variant">
              Sunday - Thursday: 9am - 6pm (BDT)<br />
              Friday - Saturday: Closed
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}

export default Contact;
