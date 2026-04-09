const faders = document.querySelectorAll(".fade");

const appearOptions = { threshold:0.3 };

const appearOnScroll = new IntersectionObserver(function(entries){

entries.forEach(entry => {
    if(!entry.isIntersecting)
        { return; }

entry.target.classList.add("show"); }); }, appearOptions);

faders.forEach(fader => { appearOnScroll.observe(fader); });


const translations = {

tr: {
    game: "Oyun",
    orj: "Orjinal Tema.",
    home: "Home",
    features: "Özellikler",
    weapons: "Silahlar",
    trailer: "Tanıtım",
    download: "İndir",
    videogame: "Video oyunu dünyama hoş geldin!",
    downloadgame: "Oyun İndir",
    gamefeatures: "Oyun Özellikleri",
    openWorld: "Açık Dünya",
    explore: "Devasa şehirleri keşfet.",
    epicBosses: "Efsane Patronlar",
    epic: "Dev mutantlar ve savaş makineleriyle savaş.",
    upgradeSystem: "Geliştirme Sistemi",
    upgrade: "Silahlarını ve yeteneklerini özelleştir.",
    weapons: "Silahlar",
    uzi: "Lazer UZI",
    fast: "Hızlı ateş eden fütüristik silah.",
    spaz: "Güç Spaz'ı",
    massive: "Av tüfeğiyle verilen çok büyük hasar.",
    cannon: "Plazma Topu",
    plasma: "Patlayıcı plazma teknolojisi.",
    gt: "Oyun Fragmanı",
    puzzle: "Yeni oyunumuz Hafıza Kartı Bulmacasını mutlaka denemelisiniz!",
    now: "Şimdi İndir",
    world: "Kendinizi silahlar, mutantlar, tuzaklar ve... meyvelerle dolu tehlikeli retro dünyaya bırakın. <br> Oyunu indirin ve dünyayı kurtarın!",
    trybtn1: "Oyunu Dene 1",
    trybtn2: "Oyunu Dene 2",
},

en: {
    game: "Game",
    orj: "Be theme original.",
    home: "Home",
    features: "Features",
    weapons: "Weapons",
    trailer: "Trailer",
    download: "Download",
    videogame: "Welcome to my video game world!",
    downloadgame: "Download Game",
    gamefeatures: "Game Features",
    openWorld: "Open World",
    explore: "Explore massive cities.",
    epicBosses: "Epic Bosses",
    epic: "Fight giant mutants and war machines.",
    upgradeSystem: "Upgrade System",
    upgrade: "Customize your weapons and skills.",
    weapons: "Weapons",
    uzi: "Laser UZI",
    fast: "Fast firing futuristic weapon.",
    spaz: "Power SPAZ",
    massive: "Massive shotgun damage.",
    cannon: "Plasma Cannon",
    plasma: "Explosive plasma technology.",
    gt: "Game Trailer",
    puzzle: "You should definitely try our new game, the Memory Card Puzzle!",
    now: "Download Now",
    world: "Immerse yourself into the dangerous retro world, full of weapons, mutants, traps and... fruits. <br> Download The Game and save the world!",
    trybtn1: "TRY GAME 1",
    trybtn2: "TRY GAME 2",
}
};

const languageSelect = document.getElementById("languageSelect");

languageSelect.addEventListener("change", () => {

const lang = languageSelect.value;

document.querySelectorAll("[data-key]").forEach(element => {

const key = element.getAttribute("data-key");

element.innerHTML = translations[lang][key];

});

});