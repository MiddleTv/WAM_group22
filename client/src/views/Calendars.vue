<template>
  <div class="calendars">
    <h1 v-if="networkMsg"> {{ networkMsg }} </h1>
    <h1 v-else-if="calendars.length === 0"> There are no calendars registered </h1>
    <h1 v-else-if="calendars.length === 1"> There is one calendar </h1>
    <h1 v-else > There are {{ calendars.length }} calendars </h1>
    <b-button type="button" class="createButton" @click="createCalendar()">Create Calendar</b-button>
    <b-button class="deleteButton" v-show="calendars.length" @click="deleteAllCalendars()">Delete All Calendars</b-button>
    <b-list-group>
      <calendar-item v-for="calendar in calendars" :key="calendar._id" :calendar="calendar" @delete-calendar="deleteCalendar" @calendar-content-changed="contentChanged"></calendar-item>
    </b-list-group>
  </div>
</template>

<script>
import { Api } from '@/Api'
import CalendarItem from '@/components/CalendarItem'
var networkMsg = ''

export default {
  name: 'Calendars',
  data() {
    return {
      calendars: [],
      networkMsg
    }
  },
  mounted() {
    this.getCalendars()
  },
  methods: {
    getCalendars() {
      Api.get('/calendars')
        .then(reponse => {
          this.calendars = reponse.data.calendars
        })
        .catch(error => {
          this.calendars = []
          console.log(error)
          this.networkMsg = 'Check Connection to Database'
        })
        .then(() => {
          // This code is always executed (after success or error).
        })
    },

    deleteCalendar(id) {
      Api.delete(`/calendars/${id}`)
        .then(response => {
          console.log(response.data.message)
          // console.log(response.data.message)
          var index = this.calendars.findIndex(calendar => calendar._id === id)
          this.calendars.splice(index, 1)
        })
        .catch(error => {
          console.log(error)
        })
    },
    createCalendar() {
      var curDate = localStorage.getItem('selectedDate')

      if (curDate === '') { curDate = (new Date()).substring(0, 10) }

      // var tempMonth = this.getRandomMonth()
      // var text = '2019-' + tempMonth + '-' + this.getRandomDay(tempMonth)

      var randomCalendar = {
        targetDate: curDate
      }
      Api.post('/calendars', randomCalendar)
        .then(response => {
          this.calendars.push(response.data)
        })
        .catch(error => {
          console.log(error)
        })
        .then(() => {
          this.getCalendars()
          // This code is always executed (after success or error).
        })
    },
    getRandomInt(max) {
      var result = Math.floor(Math.random() * max)
      if (result) {
        return result
      } else { return ++result }
    },
    getRandomMonth() {
      var months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
      var monIndex = this.getRandomInt(months.length)
      return months[monIndex]
    },
    getRandomDay(calMonth) {
      if (calMonth === ('Oct' || 'Dec' || 'Jan' || 'Mar' || 'May' || 'Jul' || 'Aug')) {
        return this.getRandomInt(31)
      } else if (calMonth === ('Nov' || 'Apr' || 'Jun' || 'Sep')) {
        return this.getRandomInt(30)
      } else { return this.getRandomInt(28) } // for simplicity max 28
    },
    deleteAllCalendars() {
      Api.delete(`/calendars/`)
        .then(response => {
          console.log(response.data.message)
          // console.log(response.data.message)
          this.calendars = []
        })
        .catch(error => {
          console.log(error)
        })
    },
    contentChanged() {
      this.calendars = []
      this.getCalendars()
    }
  },
  components: {
    CalendarItem
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
a {
  color: #42b983;
}
.createButton {
  margin-bottom: 1em;
  background-color: rgb(59, 199, 89)
}
.deleteButton {
  margin-bottom: 1em;
  margin-left: 1em;
  background-color: rgb(226, 43, 128)
}
.calendars {
  margin-left: 5%;
  margin-right: 5%;
  margin-bottom: 2em;
}
</style>
