export const families = { peterborough: "Peterborough Jacksons", sthelens: "St Helens Jacksons" };

export const locationMeta = {
  "Flexible time": ["✨","flex"], "Travel": ["✈️","travel"], "Magic Kingdom": ["🏰","mk"],
  "EPCOT": ["🌐","epcot"], "Hollywood Studios": ["🎬","hs"], "Animal Kingdom": ["🦁","ak"],
  "Disney Springs": ["🛍️","springs"], "Celebration": ["🌴","celebration"], "Water Park": ["🌊","water"],
  "Epic Universe": ["🌌","epic"], "Universal / Islands of Adventure": ["🎢","universal"],
  "CityWalk": ["🌆","citywalk"], "Cruise": ["🚢","cruise"], "Nassau": ["🏝️","nassau"],
  "Castaway Cay": ["🐚","castaway"], "Home": ["🏠","home"]
};
const f={m:"Flexible time",a:"Flexible time",e:"Flexible time"};
const d=(date,p={},s={},events=[])=>({date,p:{...f,...p},s:{...f,...s},events});
export const schedule = [
 d("2026-08-14",{}, {m:"Travel",a:"Travel",e:"Disney Springs"}, ["Flight 9:15 am · Arrive 1:45 pm","Walmart / Target","Chili’s or Cheesecake Factory"]),
 d("2026-08-15",{}, {m:"Magic Kingdom",a:"Magic Kingdom",e:"Magic Kingdom"}, ["8:50 am Big Thunder","9:35 am Buzz","10:15 am Pirates","11:30 am Crystal Palace","1:00 pm TRON"]),
 d("2026-08-16",{}, {m:"Animal Kingdom",a:"EPCOT",e:"EPCOT"}, ["5:10 pm Teppan Edo","7:05 pm Guardians"]),
 d("2026-08-17",{}, {m:"Water Park",a:"Hollywood Studios",e:"Hollywood Studios"}, ["4:50 pm Hollywood & Vine","Fantasmic!"]),
 d("2026-08-18",{}, {m:"Magic Kingdom",a:"Magic Kingdom",e:"Disney Springs"}, ["Disney Springs / outlets"]),
 d("2026-08-19",{}, {m:"EPCOT",a:"EPCOT",e:"EPCOT"}, ["6:50 pm ’Ohana","Fireworks from Polynesian"]),
 d("2026-08-20",{m:"Travel",a:"Travel"},{m:"Hollywood Studios",a:"Hollywood Studios",e:"Hollywood Studios"}, ["St Helens: 9:15 Slinky · 10:15 Toy Story Mania · 11:15 Tower of Terror","5:30 pm Roundup Rodeo"]),
 d("2026-08-21",{m:"Magic Kingdom",e:"EPCOT"},{m:"Magic Kingdom",a:"Magic Kingdom",e:"Magic Kingdom"}, ["St Helens: 5:00 pm Steakhouse 71"]),
 d("2026-08-22",{m:"Animal Kingdom",e:"Disney Springs"},{m:"Animal Kingdom",a:"Animal Kingdom",e:"Disney Springs"}, ["Homecomin’ overlap · St Helens booking 6:15 pm"]),
 d("2026-08-23",{m:"Celebration",a:"EPCOT",e:"EPCOT"},{m:"Water Park",a:"Water Park",e:"Water Park"}, ["St Helens: 5:30 pm Boma"]),
 d("2026-08-24",{m:"Hollywood Studios",e:"Magic Kingdom"},{m:"Hollywood Studios",a:"Hollywood Studios",e:"Hollywood Studios"}, ["Peterborough: 4:20 pm Beak & Barrel","St Helens: 9:00 am Topolino’s"]),
 d("2026-08-25",{m:"EPCOT",a:"Magic Kingdom"},{m:"Magic Kingdom",a:"Magic Kingdom",e:"Magic Kingdom"}, ["St Helens: 5:30 pm Be Our Guest"]),
 d("2026-08-26",{m:"Magic Kingdom",e:"CityWalk"},{m:"Hollywood Studios",a:"Hollywood Studios",e:"Magic Kingdom"}, ["Leo’s 1st haircut · morning","Peterborough: Wailulu Bar & Grill","St Helens: 7:00 pm Cinderella’s Royal Table · Happily Ever After"]),
 d("2026-08-27",{m:"Epic Universe",a:"Epic Universe",e:"Epic Universe"},{m:"EPCOT",a:"EPCOT",e:"Magic Kingdom"}, ["St Helens: Food & Wine · 6:00 pm Whispering Canyon"]),
 d("2026-08-28",{m:"Universal / Islands of Adventure",a:"Universal / Islands of Adventure",e:"Universal / Islands of Adventure"},{m:"Cruise",a:"Cruise",e:"Cruise"}, ["St Helens cruise embarkation"]),
 d("2026-08-29",{m:"Animal Kingdom"},{m:"Nassau",a:"Nassau",e:"Cruise"}, ["Peterborough: Yak & Yeti","St Helens: 9:45 am Royal Gathering"]),
 d("2026-08-30",{m:"EPCOT"},{m:"Castaway Cay",a:"Castaway Cay",e:"Cruise"}, []),
 d("2026-08-31",{a:"EPCOT",e:"EPCOT"},{m:"Cruise",a:"EPCOT",e:"EPCOT"}, ["Peterborough: Keke’s / First Watch","St Helens: disembark · Hollywood Studios → EPCOT · Eat to the Beat"]),
 d("2026-09-01",{m:"Hollywood Studios",a:"Hollywood Studios"},{m:"Flexible time",a:"Flexible time",e:"Travel"}, ["St Helens return flight 8:30 pm"]),
 d("2026-09-02",{}, {m:"Travel",a:"Home",e:"Home"}, ["St Helens arrive 9:40 am"]),
 d("2026-09-03",{}, {}, [])
];
function outsideTrip(date, start, end) {
2
return date < start || date > end;
3
}
4
 
5
schedule.forEach(day => {
6
 
7
if (
8
outsideTrip(
9
day.date,
10
"2026-08-20",
11
"2026-09-03"
12
)
13
) {
14
 
15
day.p = {
16
m: "Home",
17
a: "Home",
18
e: "Home"
19
};
20
 
21
}
22
 
23
if (
24
outsideTrip(
25
day.date,
26
"2026-08-14",
27
"2026-09-01"
28
)
29
) {
30
 
31
day.s = {
32
m: "Home",
33
a: "Home",
34
e: "Home"
35
};
36
 
37
}
38
 
39
});
export const explicitOverlaps = {
 "2026-08-21":["m"], "2026-08-22":["m","e"], "2026-08-24":["m"], "2026-08-25":["a"], "2026-08-31":["a","e"]
};
export const slotNames={m:"Morning",a:"Afternoon",e:"Evening"};
