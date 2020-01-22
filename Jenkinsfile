pipeline {
    agent any

    tools {nodejs "node"}

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