// Customer words for the testimonials section.
//
// REAL: the first entry is a public comment a customer left on Henle's Facebook page (Dec 2018).
// SAMPLE SLOTS: entries with `sample: true` are placeholders, shown with a "Sample slot" label. In production this
// section should be fed from Henle's Google Business Profile reviews (names, stars and text exactly as posted).

export const reviewSummary = {
  rating: 4.7,
  googleReviewsUrl: 'https://www.google.com/maps/search/?api=1&query=Henle+Printing+Company+703+Ontario+Rd+Marshall+MN',
}

export const reviews = [
  {
    id: 'smac',
    text: 'What a great group to work with when serving our clients at SMAC.',
    name: 'Mike Rich',
    detail: 'Comment on Henle’s Facebook page, December 2018',
    stars: 5,
  },
  {
    id: 'sample-1',
    sample: true,
    text: 'Your best Google review goes here, shown exactly as the customer wrote it, with their name and star rating.',
    name: 'A Henle customer',
    detail: 'Pulled from your Google Business Profile',
    stars: 5,
  },
  {
    id: 'sample-2',
    sample: true,
    text: 'A second review about turnaround, quality, or the people at the counter. We can feature the ones you choose.',
    name: 'A Henle customer',
    detail: 'Pulled from your Google Business Profile',
    stars: 5,
  },
]
