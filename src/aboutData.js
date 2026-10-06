// Content for the About page.
//
// SOURCES
//  - "FB"  = Henle Printing Company's public Facebook posts (Nov–Dec 2018, Mar–Apr 2019)
//  - "MI"  = Marshall Independent, "Keeping the presses running" (Feb 2020)
//  - "Site" = henleprinting.com
//
// PHOTOS you can drop in (JPG, files are looked up automatically):
//  - Crew portraits ........ public/team/<file>   800 × 1000 px (4:5 portrait), JPG, head-and-shoulders, centered
//  - Heritage portraits .... public/history/<file> 800 × 1000 px (4:5 portrait)
//  - Archive photos ........ public/history/<file> 1600 px wide or larger, landscape
// Until a file exists, the card shows a red-backdrop monogram (the same red as Henle's portrait backdrop).

const base = import.meta.env.BASE_URL
const team = (file) => `${base}team/${file}`
const history = (file) => `${base}history/${file}`

export const mike = {
  name: 'Mike Henle',
  photo: `${base}pics/mike.jpg`,
  started: 1980,
  startedAge: 16,
  quotes: [
    {
      id: 'customers',
      label: 'On customers',
      text: 'I love helping them with the large variety of projects. I enjoy meeting and exceeding their expectations in regards to quality and delivery.',
      source: 'Henle Printing Company on Facebook, Dec 2018',
    },
    {
      id: 'deadlines',
      label: 'On deadlines',
      text: 'One question I hear all the time from the customers is: ‘I know this is last minute, but can I still get it by…’ We work hard to deliver all projects on time, sometimes even taking what seems impossible and exceeding the customers’ expectations.',
      source: 'Henle Printing Company on Facebook, Dec 2018',
    },
    {
      id: 'crew',
      label: 'On the crew',
      text: 'My entire staff truly cares about each project: doing the best job possible, meeting the customers’ expectations and deadlines and being fair with our pricing. Our entire staff works together as a family to complete each project that comes in our door.',
      source: 'Henle Printing Company on Facebook, Dec 2018',
    },
    {
      id: 'future',
      label: 'On what’s next',
      text: 'The future is going to be so much more in personalization.',
      source: 'Marshall Independent, Feb 2020',
    },
  ],
}

export const heritage = [
  {
    id: 'gen-1',
    generation: 'First generation',
    name: 'A.J. Henle',
    note: 'Started the Monthly Magnet newspaper in Lyon County in 1926.',
    file: 'gen-1.jpg',
    photo: history('gen-1.jpg'),
  },
  {
    id: 'gen-2',
    generation: 'Second generation',
    name: 'Mike’s father',
    note: 'A.J.’s sons Larry and Ray founded the Lyon County Independent and a commercial printing company. Mike started in the shop alongside his father and grandfather.',
    file: 'gen-2.jpg',
    photo: history('gen-2.jpg'),
  },
  {
    id: 'gen-3',
    generation: 'Third generation',
    name: 'Mike Henle',
    note: 'Joined the shop in 1980 at 16 and went on to lead Henle Printing Company.',
    file: 'mike.jpg',
    photo: `${base}pics/mike.jpg`,
    position: '58% 20%',
  },
]

export const timeline = [
  {
    id: '1926',
    year: '1926',
    title: 'A.J. Henle starts the Monthly Magnet',
    text: 'The Henle family’s printing story begins in Lyon County, when A.J. Henle—Mike’s grandfather—starts a newspaper called the Monthly Magnet. His sons Larry and Ray would go on to found the weekly Lyon County Independent and a commercial printing company.',
    source: 'Marshall Independent, Feb 2020',
  },
  {
    id: 'main-street',
    year: 'Early days',
    title: 'A Henle Printing sign on Marshall’s Main Street',
    text: 'The sign hangs over the street, next to the Grill Café and the First National Bank clock. “We have built our reputation on exceptional customer service and outstanding print materials,” the company wrote. “Day in and day out, it’s what we do. And, we love what we do.”',
    source: 'Henle Printing Company on Facebook, Apr 2019',
    photo: history('main-street.jpg'),
    photoAlt: 'A vintage photograph of Marshall’s Main Street with a Henle Printing sign hanging over the sidewalk',
    file: 'main-street.jpg',
    caption: 'Main Street, Marshall',
  },
  {
    id: 'linotype',
    year: 'The Linotype years',
    title: 'Hot metal, one line at a time',
    text: 'A.J. Henle at the State Fair, at the keyboard of a Linotype machine, with a former state senator looking on. A Linotype cast an entire line of metal type at once—hence a “line-o’-type”—and was a mainstay of newspaper and poster typesetting until the 1970s and ’80s.',
    source: 'Henle Printing Company on Facebook, Mar 2019',
    photo: history('linotype.jpg'),
    photoAlt: 'A.J. Henle seated at a Linotype machine while a former state senator looks on',
    file: 'linotype.jpg',
    caption: 'A.J. Henle at a Linotype machine',
  },
  {
    id: '1950s',
    year: '1950s',
    title: 'The first Schwan’s ice cream cartons',
    text: 'In the 1950s, Henle’s printed the first Schwan ice cream cartons for Marvin Schwan. Here is Schwan’s Dairy, Inc. in Marshall.',
    source: 'Henle Printing Company on Facebook, Mar 2019 · photo via Lyon County Historical Society',
    photo: history('schwan-dairy.jpg'),
    photoAlt: 'A black-and-white photograph of the Schwan’s Dairy building and Raine’s Café in Marshall, with 1950s cars parked out front',
    file: 'schwan-dairy.jpg',
    caption: 'Schwan’s Dairy, Inc., Marshall',
  },
  {
    id: '1973',
    year: '1973',
    title: 'The newspaper is sold—but not the ink',
    text: 'The family sells the newspaper, but A.J. and Ray Henle are back in the printing business by the 1980s with Henle Speedy Print.',
    source: 'Marshall Independent, Feb 2020',
  },
  {
    id: '1980',
    year: '1980',
    title: 'Mike, 16, and Marc, 14, come aboard',
    text: 'Mike Henle starts at the shop at 16. Marc Klaith starts at 14 as a delivery person, riding along with A.J. Henle. He goes on to become the shop’s production manager.',
    source: 'Henle Printing Company on Facebook, Dec 2018',
  },
  {
    id: '1989',
    year: '1989',
    title: 'Henle Printing Company',
    text: 'Henle Speedy Print is renamed Henle Printing Company, the name still on the door today.',
    source: 'Marshall Independent, Feb 2020',
  },
  {
    id: '2018',
    year: '2018',
    title: '179 years of combined experience',
    text: '“Did you know our employees have more than 179 years experience in the print industry collectively? We think the crew here at Henle Printing is the best!”',
    source: 'Henle Printing Company on Facebook, Dec 2018',
  },
  {
    id: '2020',
    year: '2020',
    title: 'A new chapter, the same name',
    text: 'Charlie Stark becomes the new owner on January 1, 2020, and Mike stays on through March to help with the transition. “I believe Charlie and I have the same vision,” Mike says. The name stays the same.',
    source: 'Marshall Independent, Feb 2020',
  },
  {
    id: 'today',
    year: 'Today',
    title: 'The first printer in Minnesota with high speed inkjet',
    text: 'In 2020, Charlie Stark said: “Eventually, I see it going to high speed inkjet printing and variable data printing.” Today Henle runs a Fuji Film J-Press with over 130,000 nozzles, the first in Minnesota, and Variable Data Processing is one of the services we offer.',
    source: 'Marshall Independent, Feb 2020 · henleprinting.com',
    link: { to: '/inkjet-printing', label: 'See inkjet printing' },
  },
]

export const eras = [
  {
    id: 'hot-metal',
    years: 'Late 1800s – 1970s',
    name: 'Hot metal',
    tool: 'Linotype',
    text: 'A keyboard, a pot of molten metal, and a whole line of type cast at once. For decades this was how newspapers, magazines, and posters were set.',
    source: 'Henle Printing Company on Facebook, Mar 2019',
  },
  {
    id: 'offset',
    years: '1970s – today',
    name: 'Offset lithography',
    tool: 'Five presses',
    text: 'Ink onto a plate, then a blanket, then the sheet. Henle’s five presses handle one color to six, plus letterpress and die cuts.',
    source: 'henleprinting.com',
  },
  {
    id: 'digital',
    years: '1990s – today',
    name: 'Digital printing',
    tool: 'Versant & Xante',
    text: 'No plates, fast turnaround, and every piece can be different: Variable Data Processing makes each one personal.',
    source: 'henleprinting.com',
  },
  {
    id: 'inkjet',
    years: 'Today',
    name: 'High speed inkjet',
    tool: 'Fuji Film J-Press',
    text: 'Over 130,000 nozzles place ink with sharp lines down to 2-point type, with the same quality “from the first sheet to the last.” Henle is the first printer in Minnesota with this capability.',
    source: 'henleprinting.com',
  },
]

// Roster: from Henle's Dec 2018 "team" Facebook photo plus the Marshall Independent (Feb 2020).
// CONFIRM WITH HENLE who is currently on the team. `file` = portrait filename in public/team/.
export const crew = [
  {
    id: 'charlie',
    name: 'Charlie Stark',
    role: 'Owner',
    group: 'Leadership',
    since: 2020,
    sinceLabel: 'Owner since 2020',
    file: 'charlie.jpg',
    bio: 'In printing since he was 13, with a long career in composition and customer service at larger printers before opening a shop of his own in Minneapolis. He took over Henle Printing on January 1, 2020.',
    source: 'Marshall Independent, Feb 2020',
  },
  {
    id: 'marc',
    name: 'Marc Klaith',
    role: 'Production Manager',
    group: 'Press & production',
    since: 1980,
    file: 'marc.jpg',
    bio: 'Started at 14 as a delivery person, riding along with A.J. Henle. Today Marc oversees all production scheduling and works with all areas of bindery.',
    source: 'Henle Printing Company on Facebook',
  },
  {
    id: 'natasha',
    name: 'Natasha',
    role: 'Customer Service Representative',
    group: 'Front office',
    since: 2017,
    file: 'natasha.jpg',
    bio: 'The person you’re likely to see when you first walk in the door.',
    source: 'Mike Henle, Dec 2018',
  },
  {
    id: 'traci',
    name: 'Traci',
    role: 'Graphic Designer',
    group: 'Design',
    since: 1997,
    file: 'traci.jpg',
    bio: 'Henle’s designers specialize in printed materials, from preparing finished files for error-free printing to turning a rough idea into a finished piece.',
    source: 'henleprinting.com',
  },
  {
    id: 'barb',
    name: 'Barb',
    role: 'Graphic Designer',
    group: 'Design',
    since: 2012,
    file: 'barb.jpg',
    bio: 'Henle’s designers specialize in printed materials, from preparing finished files for error-free printing to turning a rough idea into a finished piece.',
    source: 'henleprinting.com',
  },
  {
    id: 'cybil',
    name: 'Cybil',
    role: 'Graphic Designer',
    group: 'Design',
    since: 2015,
    file: 'cybil.jpg',
    bio: 'Henle’s designers specialize in printed materials, from preparing finished files for error-free printing to turning a rough idea into a finished piece.',
    source: 'henleprinting.com',
  },
  {
    id: 'diane',
    name: 'Diane',
    role: 'Press Operator',
    group: 'Press & production',
    since: 1992,
    file: 'diane.jpg',
    bio: 'The press crew skillfully manages your job through the entire process, so every sheet looks just as good as the first.',
    source: 'henleprinting.com',
  },
  {
    id: 'ben',
    name: 'Ben',
    role: 'Press Operator',
    group: 'Press & production',
    since: 1999,
    file: 'ben.jpg',
    bio: 'The press crew skillfully manages your job through the entire process, so every sheet looks just as good as the first.',
    source: 'henleprinting.com',
  },
  {
    id: 'george',
    name: 'George',
    role: 'Press Operator',
    group: 'Press & production',
    since: 2000,
    file: 'george.jpg',
    bio: 'The press crew skillfully manages your job through the entire process, so every sheet looks just as good as the first.',
    source: 'henleprinting.com',
  },
]

export const crewGroups = ['All', 'Leadership', 'Front office', 'Design', 'Press & production']

export const promises = [
  { id: 'people', title: 'People- and service-oriented', text: 'From the person you meet at the front door to the designers, the production manager, and the press crew, everyone works to make sure each customer is completely satisfied.' },
  { id: 'last-minute', title: 'Last minute? Ask us.', text: 'We work hard to deliver all projects on time, sometimes even taking what seems impossible.' },
  { id: 'fair', title: 'Fair pricing', text: 'Doing the best job possible, meeting expectations and deadlines, and being fair with our pricing.' },
  { id: 'sincere', title: 'Sincerity', text: 'One reason people choose Henle Printing: the whole staff truly cares about each project.' },
]
