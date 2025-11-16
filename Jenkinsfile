pipeline {
    agent any
    options {
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Semgrep Static Analysis') {
            steps {
                sh '''
                echo "Running Semgrep..."
                docker run --rm \
                  -v $WORKSPACE:/src \
                  -w /src \
                  semgrep/semgrep \
                  semgrep scan --config=semgrep_rules.yaml .
                '''
            }
        }

    }
}
