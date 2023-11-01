const emoji = {
    smileyOpenMouth: '\u{1F603}',
    winkingface: '\u{1F609}',
    smilingHeartShapedEyes: '\u{1F60D}',
    foldedHands: '\u{1F64F}',
    heartRibbon: '\u{1F49D}',
    checkMark: '\u{2705}',
    crossMark: '\u{274C}',
    envelope: '\u{2709}',
    globe :'\u{1F30F}',
    haze:'\u{1F301}',
    smoke:'\u{2668}',
    cold: '\u{2744}',
    rainDrops: '\u{2614}',
    clearSun: '\u{2600}',
    sunCloud: '\u{26C5}',
    cloud: '\u{2601}',
    sun:'\u{2600}',
    celcius:'\u{2103}',
    wind:'\u{1F343}',
    pushpin: '\u{1F4CC}',
    rightwardsArrow: '\u{27A1}',
    partyPopper: '\u{1F389}',
    hundredPoints: '\u{1F4AF}',
    pencil: '\u{270F}'
  };
const message = {
    goodMorning: `Good Morning`,
    goodAfternoon: `Good Afternoon`,
    goodEvening: `Good Evening`,
    start:`/start the bot`,
    isBlocked: `You had been blocked by the Admin
    \n/start to know your status`,
    subscribed: `How can we help you today ?\n /help`,
    subscribedHelp: `Get the weather update of any city instantly and prepare your day accordingly ${emoji.hundredPoints}.
      \n${emoji.pushpin} use the following commands :
      \n${emoji.rightwardsArrow} /getcurrentweather
      \n${emoji.rightwardsArrow} /changecity
      \n${emoji.rightwardsArrow} /differentcityweather`,
    notSubscribed: `Subscribe to Get daily weather updates. Stay prepared with accurate forecasts ${emoji.checkMark}
    \n/subscribe`,
    notSubscribedHelp: `Get the weather update of any city ${emoji.globe} instantly and prepare your day accordingly ${emoji.hundredPoints}.
      \n${emoji.smileyOpenMouth} Please start the bot again /start
      \n${emoji.crossMark} You're not Subscribed.`,
      subscribeCommand:`One more step ${emoji.foldedHands}
      \nPlease provide the city ${emoji.globe} for which you wish to receive daily weather updates.
      \n${emoji.pushpin} Provide the command like :
      \n${emoji.rightwardsArrow} /city cityName
      \n${emoji.pencil} example : /city Gurugram`,
      changeCityCommand:`One more step ${emoji.foldedHands}
      \nPlease provide the city ${emoji.globe} you wish to select
      \n${emoji.pushpin} Provide the command like :
      \n${emoji.rightwardsArrow} /change cityName
      \n${emoji.pencil} example : /change Gurugram`,
      differentCityCommand:`Which city weather you would like to know ${emoji.globe}
      \n${emoji.pushpin} Provide the command like :
      \n${emoji.rightwardsArrow} /different cityName
      \n${emoji.pencil} example : /different Gurugram`,
      inValid: `Invalid command`,
      catchIssue:`we're unable to connect ${emoji.crossMark}
      \nPlease try in some time ${emoji.foldedHands}`
  };

  export { message, emoji };