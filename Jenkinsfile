pipeline {
    agent any

    tools {nodejs "node"}
     
     environment { 
        mode='testing'
        databaseString='mongodb://localhost/cs_grad_data-test'
        port=8080
        host='127.0.0.1'
    }

    stages {
        stage('Dependencies') {
            steps {
                sh 'npm i'
            }  
        }
        stage('Build') {
            steps {
                sh 'npm test'
            }
        }
        stage('e2e Tests') {
            steps {
                sh 'npm run cypress:ci'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
            }
        }
    }
}