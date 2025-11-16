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
          semgrep --config semgrep_rules.yaml .
        '''
      }
    }

  }
}
