import React from 'react';
import {
  Form, FormGroup, Input, Button
} from 'reactstrap';

import './Main.css';

export default class Loginpage extends React.Component {
    constructor(props){
        super(props);
        this.handleValidSubmit = this.handleValidSubmit.bind(this);

        // component state
        this.state = {
            PID: '',
            password: '',
        };
    }

    // Handle submission once all form data is valid
    handleValidSubmit() {
        const { loginFunction } = this.props;
        const formData = this.state;
        loginFunction(formData);
    }

    render() {
        return (
        <body className="Loginpage-body">
            <div>
                <h1>
                    <span className="Loginpage-headerone">
                        UNC-CH
                        Graduate
                        Tracking
                    </span>
                </h1>
                <Form className="login-form">
                    <FormGroup>
                        <Input 
                            id="PID"
                            minLength="9"
                            name="PID"
                            onChange={this.handleInputChange}
                            onKeyPress={this.handleKeyPress}
                            placeholder="PID"
                            required
                            type="PID"
                            value={this.state.PID}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Input
                            id="password"
                            minLength="4"
                            name="password"
                            onChange={this.handleInputChange}
                            onKeyPress={this.handleKeyPress}
                            placeholder="password"
                            required
                            type="password"
                            value={this.state.password}
                        />
                    </FormGroup>
                </Form>
                <div>
                    {/* <a
                    className="Loginpage-link"
                    href="https://csgrad.cs.unc.edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    Forgot your password?
                    </a> */}
                <br/>
                    <Button 
                        className="Loginpage-button"
                        href="https://csgrad.cs.unc.edu"
                    >
                        Login
                    </Button>
                </div>
            </div>
        </body>
        );
    }
}