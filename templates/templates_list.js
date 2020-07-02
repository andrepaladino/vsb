module.exports.loadTemplates = {
    templates: [
        {
            number: 1,
            name: 'Start Doing',
            description: 'A start stop continue retrospective is a simple and effective way for teams to reflect on their recent experiences and decide on what they should change as they move forward.',
            image: '/retroimages/stop_continue_start.jpg',
            categories: [
                {
                    id: 'stopdoing',
                    name: 'Stop Doing'
                },
                {
                    id: 'continuedoing',
                    name: 'Continue Doing'
                },
                {
                    id: 'startdoing',
                    name: 'Start Doing'
                }
            ]
        },

        {
            number: 2,
            name: 'Hot-air balloon',
            description: 'This is a simple activity for helping the team to identify things that makes them move faster, and things that slow them down.',
            image: '/retroimages/hotair_balloon.jpg',
            categories: [
                {
                    id: 'hotair',
                    name: 'Hot-Air'
                },
                {
                    id: 'anchors',
                    name: 'Anchors'
                }
            ]
        },

        {
            number: 3,
            name: 'Mad/Sad/Glad',
            description: 'Discussion around the emotional journey of by your team during the previous sprint, and is a great way to identify opportunities to improve team morale and job satisfaction.',
            image: '/retroimages/mad_sad_glad.jpg',
            categories: [
                {
                    id: 'mad',
                    name: 'Mad'
                },
                {
                    id: 'sad',
                    name: 'Sad'
                },
                {
                    id: 'glad',
                    name: 'Glad'
                }
            ]
        }
        
    ]
}