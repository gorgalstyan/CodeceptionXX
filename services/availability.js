import moment from 'moment'

let roomsAvailabilityData = null;

const processPromise = new Promise(function (resolve, reject) {
    setTimeout(function () {
        processAvailabilityData();
        resolve(roomsAvailabilityData);
    }, 1000);
});

export default function getRoomsAvailabilityData() {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            if (roomsAvailabilityData){
                return resolve(roomsAvailabilityData);
            }
            processPromise.then(res => resolve(res));
        }, 50);
    });
};

const eodTime = 19*60;

function processAvailabilityData() {
    const avAilabilityServerData = require('../fixtures/availability.json')
    if (!avAilabilityServerData || !avAilabilityServerData.Body
        || !avAilabilityServerData.Body.Responses) {
        return null;
    }
    roomsAvailabilityData = {};
    const responses = avAilabilityServerData.Body.Responses;
    responses.map(response => {
        const calendarItems = ((response || {}).CalendarView || {}).Items || []
        calendarItems.map(cItem => {
            const roomId = ((cItem || {}).ParentFolderId || {}).Id;
            if (!roomId) return;
            const subject = cItem.Subject;
            const start = moment(cItem.Start);
            const end = moment(cItem.End);

            let roomAvailabilityData = roomsAvailabilityData[roomId];
            if (!roomAvailabilityData) {
                roomAvailabilityData = roomsAvailabilityData[roomId] = {};
            }

            const meetingInfo = {
                id: cItem.ItemId.Id,
                subject,
                start,
                end,
            }
            for (let dtime = start.clone(); dtime < end; dtime.add(1, 'd').hour(7)) {
                const doy = dtime.dayOfYear();
                // const eodTime = dtime.clone().hour(19).minute(0);
                let dayData = roomAvailabilityData[doy]
                if (!dayData) {
                    dayData = roomAvailabilityData[doy] = {};
                }
                const mmtMidnight = dtime.clone().startOf('day');
                let currentMins = dtime.diff(mmtMidnight, 'minutes');
                currentMins = Math.floor(currentMins / 5) * 5; // to ensure 5 min granularity
                const endMins = end.diff(mmtMidnight, 'minutes'); // can we do better/faster?
            
                for (let time = currentMins; time < endMins && time < eodTime; time += 5) {
                    dayData[time] = meetingInfo; // assuming one meeting per room, or only last one will be visible
                }
            }
        })
    })
}