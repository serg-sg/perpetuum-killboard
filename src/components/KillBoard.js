import React, { Component } from "react";
import Victim from './Victim';
import Victims from './Victims';
import { apiUrl } from '../config';
import loadingGif from '../images/loading.gif';

var httpBuildQuery = require('http-build-query');

class KillBoard extends Component {
  constructor(props) {
    super(props);
    this.handleClickNext = this.handleClickNext.bind(this);
    this.handleClickPrev = this.handleClickPrev.bind(this);
    this.handleClickFirst = this.handleClickFirst.bind(this);
    this.handleClickLast = this.handleClickLast.bind(this);
    this.populateTableFromAPI = this.populateTableFromAPI.bind(this);
    this.state = {
      'kills': [],
      'page': this.state != null ? this.state.page : 1,
      'prev': this.state != null ? this.state.page : 1,
      'page_count': this.state != null ? this.state.page_count : 1,
      'loaded': false
    };
  }

  handleClickNext() {
    this.populateTableFromAPI(this.state.next);
  }

  handleClickPrev() {
    this.populateTableFromAPI(this.state.prev);
  }

  handleClickFirst() {
    this.populateTableFromAPI(1);
  }

  handleClickLast() {
    this.populateTableFromAPI(this.state.page_count);
  }


  populateTableFromAPI(pageNum) {
    this.setState({ 'loaded': false });
    var searchParams = {
      'order-by': [
        {
          'type': 'field',
          'field': 'date',
          'direction': 'desc',
        },
      ],
      'page': pageNum
    };

    fetch(new URL('/killboard/kill?' + httpBuildQuery(searchParams), apiUrl), {
      method: 'GET',
      headers: new Headers({
        "Accept": "application/*+json",
      }),
    })
      .then(response => {
        return response.json();
      })
      .then(json => {
        this.setState({
          'loaded': true,
          'page': json.page,
          'next': json.page + 1,
          'prev': json.page - 1,
          'page_count': json.page_count,
          'kills': json._embedded.kill.map(function (kill) {
            return (
              <Victim
                key={kill.id}
                killId={kill.id}
                victimRobot={kill._embedded.robot.name}
                victimAgent={kill._embedded.agent.name}
                victimCorporation={kill._embedded.corporation.name}
                attackerAgent={
                  kill._embedded.attackers.map(function (attacker) {
                    if (attacker.hasKillingBlow === true) {
                      return attacker._embedded.agent.name;
                    }
                    return '';
                  })
                }
                attackerCorporation={
                  kill._embedded.attackers.map(function (attacker) {
                    if (attacker.hasKillingBlow === true) {
                      return attacker._embedded.corporation.name;
                    }
                    return '';
                  })
                }
                attackerCount={kill._embedded.attackers.length}
                zone={kill._embedded.zone.name}
                date={kill.date}
              />
            );
          }),
        });
      });
  }

  componentDidMount() {
    this.populateTableFromAPI(this.state.page);
  }

  render() {
    const loaded = this.state.loaded;
    var classes = "button is-large is-dark";

    // If the data has not been loaded yet, we only show the loading
    if (!loaded) {
      return (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(2px)',
          }}
        >
          <div className="has-text-centered" style={{ padding: '2em', background: '#fff', borderRadius: '8px' }}>
            <img src={loadingGif} alt="Loading..." style={{ height: '64px', marginBottom: '1em' }} />
            <p style={{ fontSize: '1.2em', color: '#666' }}>Loading killboard data, please wait...</p>
          </div>
        </div>
      );
    }

    // If there is data, we show the table and pagination
    return (
      <div>
        <Victims kills={this.state.kills} />
        <div className="buttons" style={{ marginTop: '1.5em', justifyContent: 'center' }}>
          <a className={classes} onClick={this.handleClickFirst}>First</a>
          {this.state.page > 1 && <a className={classes} onClick={this.handleClickPrev}>Prev</a>}
          {this.state.page < this.state.page_count && <a className={classes} onClick={this.handleClickNext}>Next</a>}
          <a className={classes} onClick={this.handleClickLast}>Last</a>
        </div>
      </div>
    );

  }
}

export default KillBoard;