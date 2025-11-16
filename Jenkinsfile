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
                environment {
                    SNYK_TOKEN = credentials('a02a4dc3-8191-4ee3-b81f-7365325765d3')
                }
                steps {
                    sh '''
                    echo "Running Snyk..."
                    snyk auth $SNYK_TOKEN
                    snyk test --all-projects
                    '''
                }
            }


    }
}
