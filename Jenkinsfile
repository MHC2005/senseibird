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
                semgrep scan --config=semgrep_rules.yaml --no-git .
                '''
            }
        }

    }
}
