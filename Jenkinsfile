pipeline {
    agent any
    options {
        timestamps()
    }

    stages {

        stage('Semgrep Static Analysis') {
            steps {
                sh '''
                echo "Running Semgrep..."
                semgrep scan --config=semgrep_rules.yaml .
                '''
            }
        }

        stage('Snyk Dependency Scan') {
            steps {
                withCredentials([string(credentialsId: 'SNYK_TOKEN', variable: 'SNYK_TOKEN')]) {
                    sh '''
                    echo "Running Snyk..."
                    snyk auth $SNYK_TOKEN
                    snyk test --all-projects
                    '''
                }
            }
        }

    }
}
