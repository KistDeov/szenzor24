const Contact = () => {
  return (
    <>
      <section id="support" className="pt-[100px] pb-[110px]">
        <div className="container">
          <div
            className="wow fadeInUp mx-auto mb-10 max-w-[690px] text-center"
            data-wow-delay=".2s"
          >
            <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl md:text-[44px] md:leading-tight dark:text-white">
              Lépj velünk kapcsolatba
            </h2>
            <p className="text-body text-base">
              Írj nekünk üzenetet, ha bármivel kapcsolatban kérdésed, meglátásod van és hamarosan válaszolunk. Nekünk számít a véleményed!
            </p>
          </div>
        </div>

        <div className="container">
          <div
            className="wow fadeInUp shadow-card dark:shadow-card-dark mx-auto w-full max-w-[925px] rounded-lg bg-[#F8FAFB] px-8 py-10 sm:px-10 dark:bg-[#15182B]"
            data-wow-delay=".3s"
          >
            <form>
              <div className="-mx-[22px] flex flex-wrap">
                <div className="w-full px-[22px] md:w-1/2">
                  <div className="mb-8">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Teljes név"
                      className="border-stroke text-body focus:border-primary dark:focus:border-primary w-full rounded-sm border bg-white px-[30px] py-4 text-base outline-hidden dark:border-[#34374A] dark:bg-[#2A2E44]"
                    />
                  </div>
                </div>

                <div className="w-full px-[22px] md:w-1/2">
                  <div className="mb-8">
                    <input
                      type="text"
                      name="company"
                      id="company"
                      placeholder="Cégnév (opcionális)"
                      className="border-stroke text-body focus:border-primary dark:focus:border-primary w-full rounded-sm border bg-white px-[30px] py-4 text-base outline-hidden dark:border-[#34374A] dark:bg-[#2A2E44]"
                    />
                  </div>
                </div>

                <div className="w-full px-[22px] md:w-1/2">
                  <div className="mb-8">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="Email cím"
                      className="border-stroke text-body focus:border-primary dark:focus:border-primary w-full rounded-sm border bg-white px-[30px] py-4 text-base outline-hidden dark:border-[#34374A] dark:bg-[#2A2E44]"
                    />
                  </div>
                </div>

                <div className="w-full px-[22px] md:w-1/2">
                  <div className="mb-8">
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      placeholder="Telefonszám"
                      className="border-stroke text-body focus:border-primary dark:focus:border-primary w-full rounded-sm border bg-white px-[30px] py-4 text-base outline-hidden dark:border-[#34374A] dark:bg-[#2A2E44]"
                    />
                  </div>
                </div>

                <div className="w-full px-[22px]">
                  <div className="mb-8">
                    <textarea
                      rows={6}
                      name="message"
                      id="message"
                      placeholder="Üzenet"
                      className="border-stroke text-body focus:border-primary dark:focus:border-primary w-full rounded-sm border bg-white px-[30px] py-4 text-base outline-hidden dark:border-[#34374A] dark:bg-[#2A2E44]"
                    ></textarea>
                  </div>
                </div>

                <div className="w-full px-[22px]">
                  <div className="text-center">
                    <p className="text-body mb-5 text-center text-base">
                    A Küldés gombra kattintva elfogadod az Adatvédelmi tájékoztatónkat.
                    </p>
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary/90 inline-block rounded-md px-11 py-[14px] text-base font-medium text-white"
                    >
                      Küldés
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
