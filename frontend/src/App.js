// frontend/src/App.js
import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';
import AlarmWorkbench from './components/AlarmWorkbench';
import LogLedger from './components/LogLedger';
import DispatchTicketManagement from './components/DispatchTicketManagement';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <p>接报警服务管理系统 - 前端</p>
        </header>
        <nav>
          <ul>
            <li>
              <Link to="/">首页</Link>
            </li>
            <li>
              <Link to="/workbench">接警工作台</Link>
            </li>
            <li>
              <Link to="/logs">日志台账</Link>
            </li>
            <li>
              <Link to="/dispatch">派警单管理</Link>
            </li>
          </ul>
        </nav>

        <div className="page-content">
          <Switch>
            <Route path="/workbench">
              <AlarmWorkbench />
            </Route>
            <Route path="/logs">
              <LogLedger />
            </Route>
            <Route path="/dispatch">
              <DispatchTicketManagement />
            </Route>
            <Route path="/">
              <div>欢迎使用接报警服务管理系统。请从上方导航栏选择一个模块。</div>
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;